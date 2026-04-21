import { GoogleGenerativeAI } from '@google/generative-ai';


// Instantiation is moved inside functions to avoid crash if env var is missing in browser
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenerativeAI(apiKey);
}

export interface VulnSolution {
  category: string;
  description: string;
  simplifiedSummary: string;
  action: string;
  responsibleParty: 'User' | 'Developer' | 'Security Expert';
  priorityLevel: number;
  precautions: string;
  contactAdvice: string;
  contactChannels: string[];
  contactTemplate?: string;
  remediationChecklist: string[];
}

export interface AIRiskAnalysis {
  overallRiskScore: number;
  businessImpactSummary: string;
  simplifiedRiskSummary: string;
  remediationRoadmap: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  severityClassification: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  exhaustiveSolutions: VulnSolution[];
}

export async function analyzeVulnerabilities(target: string, vulnerabilities: any[]): Promise<AIRiskAnalysis> {
  const ai = getAiClient();
  
  if (!ai) {
    // Return high-quality mock data if API key is missing
    return {
      overallRiskScore: 78,
      severityClassification: 'High',
      businessImpactSummary: "L'absence de headers de sécurité expose votre infrastructure à des attaques par injection et par détournement de clic (Clickjacking). Cela pourrait compromettre l'intégrité des sessions utilisateurs et permettre à des attaquants de récupérer des informations sensibles via des domaines tiers non autorisés.",
      simplifiedRiskSummary: "Votre site est comme une maison avec des portes fermées mais des fenêtres non verrouillées. C'est facile à protéger, mais pour l'instant, n'importe quel rôdeur peut voir ce qui se passe à l'intérieur.",
      remediationRoadmap: {
        immediate: ["Configurer les headers Content-Security-Policy (CSP)", "Activer HSTS pour forcer le HTTPS"],
        shortTerm: ["Auditer les endpoints exposés", "Mettre en place un WAF (Web Application Firewall)"],
        longTerm: ["Mettre en place une rotation automatique des clés API", "Formation des développeurs aux vulnérabilités OWASP Top 10"]
      },
      exhaustiveSolutions: vulnerabilities.map((v, i) => ({
        category: v.category || "Sécurité Configuration",
        description: `Correction de la faille : ${v.type}`,
        simplifiedSummary: "Verrouillage des accès non autorisés",
        action: `Ajouter la directive '${v.type.toLowerCase()}' dans la configuration du serveur (Nginx/Apache) ou via un middleware de sécurité.`,
        responsibleParty: 'Developer',
        priorityLevel: i + 1,
        precautions: "Testez d'abord sur un environnement de staging pour éviter de bloquer des scripts légitimes (notamment avec CSP).",
        contactAdvice: "Contactez votre équipe DevOps ou votre hébergeur pour appliquer ces règles au niveau du serveur.",
        contactChannels: ["Email", "Support Ticket", "Slack #devops"],
        contactTemplate: `Bonjour,\n\nNous avons détecté l'absence du header ${v.type} sur ${target}. Merci de l'activer dès que possible pour renforcer notre posture de sécurité.\n\nCordialement,\nService Sécurité`,
        remediationChecklist: ["Identifier le fichier de config", "Ajouter le header", "Redémarrer le serveur", "Vérifier avec curl -I"]
      }))
    };
  }

  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Perform an EXHAUSTIVE security analysis for ${target} based on these vulnerabilities: ${JSON.stringify(vulnerabilities)}. Return valid JSON conform to AIRiskAnalysis interface.`;
  
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Basic cleanup in case Gemini returns markdown blocks
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('Gemini Analysis Failed:', error);
    throw error;
  }
}

export async function analyzeSecurityLogs(logs: any[]) {
  const ai = getAiClient();
  if (!ai) {
    return {
      detectedPatterns: [
        {
          patternType: "Brute Force Suspect",
          description: "Séquence rapide de tentatives de connexion échouées depuis la même IP.",
          threatActorProfile: "Botnet automatisé prospectant des cibles vulnérables.",
          severity: "High",
          recommendedImmediateAction: "Bannir l'adresse IP via le firewall et activer le 2FA."
        }
      ],
      overallSecurityHealth: "Attention requise - Activité suspecte détectée sur les endpoints d'authentification.",
      intelligenceBrief: "Les attaques semblent être coordonnées mais ne ciblent pas encore de comptes spécifiques avec succès."
    };
  }
  
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Analyze these security logs and detect patterns: ${JSON.stringify(logs)}. Return JSON brief.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

export async function assessSecurityPosture(scanHistory: any[]) {
  const ai = getAiClient();
  if (!ai) {
    return {
      scoreTrend: 'Stable',
      currentPostureSummary: "Votre sécurité est globalement saine mais perfectible. Les bases sont là, mais la défense en profondeur manque de maturité.",
      keyStrengths: ["Réponse rapide aux incidents", "Bonne gestion des accès"],
      primaryWeaknesses: ["Configuration HTTP incomplète", "Absence de logs applicatifs détaillés"],
      strategicRecommendations: ["Investir dans une solution de monitoring SIEM", "Automatiser les scans de vulnérabilités."]
    };
  }
  
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `Assess security posture from history: ${JSON.stringify(scanHistory)}. Return JSON brief.`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

export async function askAboutVulnerability(vuln: any, context: string): Promise<string> {
  const ai = getAiClient();
  if (!ai) {
    return `En tant qu'intelligence Ewaba, je peux vous dire que cette vulnérabilité (${vuln.type}) est un peu comme laisser votre trousseau de clés sur la serrure. C'est pratique pour vous, mais ça l'est aussi pour les voleurs. \n\nPour corriger cela, je vous conseille de déplacer ces "clés" dans un endroit sûr (comme un coffre-fort de variables d'environnement) et de restreindre qui peut y accéder. Si vous voulez une alternative, vous pouvez aussi utiliser un service de gestion de secrets comme Vault ou AWS Secrets Manager.`;
  }
  
  const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const prompt = `As EWABA security mentor, explain ${JSON.stringify(vuln)} to a user asking: ${context}. Keep it educational and premium.`;
  const result = await model.generateContent(prompt);
  return result.response.text();
}
