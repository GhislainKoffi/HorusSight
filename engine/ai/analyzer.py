import os
import json
from google import genai
from google.genai import types
from dotenv import load_dotenv

# Chargement de l'environnement
# On cherche le .env dans HorusSig
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
load_dotenv(os.path.join(BASE_DIR, 'HorusSig', '.env'))

class EWABAAnalyzer:
    """
    Expert Web-Application Brain Assistant (EWABA)
    Moteur d'intelligence expert pour HorusSight.
    """
    def __init__(self, api_key=None, model_id="gemini-1.5-flash"):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model_id = model_id
        
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            print("LOG:[!] EWABA Error: GEMINI_API_KEY non trouvée. Mode dégradé activé.")

    def analyze_vulnerabilities(self, target: str, findings: list) -> dict:
        """
        Effectue une analyse de risque globale et détaillée sur les résultats du scan.
        """
        if not self.client:
            return self._get_mock_analysis(target, findings)

        prompt = f"""
        En tant qu'expert en cybersécurité de haut niveau (Ewaba Intelligence), effectue une analyse de risque 
        pour la cible {target} basée sur ces vulnérabilités : {json.dumps(findings)}.
        
        TON OBJECTIF : Communiquer clairement aux DEUX publics (le développeur et le directeur non-technique).
        
        Rendu requis : Objet JSON strictement valide respectant cette structure exacte :
        {{
          "overallRiskScore": integer (0-100),
          "businessImpactSummary": "string impact professionnel en français",
          "simplifiedRiskSummary": "analogie SIMPLE et IMAGEE (ex: la maison, la voiture) pour un non-informaticien",
          "remediationRoadmap": {{
            "immediate": ["Action 1", "Action 2"],
            "shortTerm": ["Action 3"],
            "longTerm": ["Action 4"]
          }},
          "severityClassification": "Critical" | "High" | "Medium" | "Low",
          "exhaustiveSolutions": [
            {{
              "category": "string (ex: XSS, SQLi, Headers)",
              "description": "Explication technique précise de la faille",
              "simplifiedSummary": "Explication vulgarisée pour quelqu'un qui n'y connaît rien",
              "action": "Instructions techniques précises (Incluez des extraits de code ou de config si possible)",
              "responsibleParty": "Développeur" | "Admin Systèmes" | "Expert Sécurité",
              "priorityLevel": integer (1-10, 1=Urgent),
              "precautions": "Précautions avant application",
              "contactAdvice": "À qui parler de ce problème ?",
              "contactChannels": ["Email", "Slack", "Réunion"],
              "contactTemplate": "Message prêt à l'emploi (poli et pro) pour signaler le problème",
              "remediationChecklist": [
                 "Etape 1 de vérification technique",
                 "Etape 2 de validation métier"
              ]
            }}
          ]
        }}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type='application/json'
                )
            )
            
            # Utilisation directe du parseur JSON si response_mime_type est respecté
            return json.loads(response.text)
            
        except Exception as e:
            print(f"[!] EWABA Analysis Failed: {str(e)}")
            return self._get_mock_analysis(target, findings)

    def _get_mock_analysis(self, target, findings) -> dict:
        """
        Retourne une analyse de haute qualité par défaut en cas d'erreur API ou clé manquante.
        """
        return {
            "overallRiskScore": 65 if findings else 10,
            "businessImpactSummary": "L'absence de headers de sécurité ou la présence de failles d'injection expose votre infrastructure à des attaques critiques.",
            "simplifiedRiskSummary": "Votre périmètre est comme une forteresse avec de hauts murs mais des couloirs de communication publics non cryptés.",
            "remediationRoadmap": {
                "immediate": ["Appliquer les headers de sécurité manquants", "Nettoyer les inputs utilisateurs"],
                "shortTerm": ["Audit d'architecture", "Mise en place d'un WAF"],
                "longTerm": ["CI/CD Security Scanning"]
            },
            "severityClassification": "High" if findings else "Low",
            "exhaustiveSolutions": [
                {
                    "category": findings[0]['type'] if findings else "Configuration",
                    "description": "Correction technique de la faille détectée.",
                    "simplifiedSummary": "Verrouillage des accès",
                    "action": "Utiliser des requêtes préparées ou des politiques CSP strictes.",
                    "responsibleParty": "Developer",
                    "priorityLevel": 1,
                    "precautions": "Testez en staging.",
                    "contactAdvice": "Informez le CTO.",
                    "contactChannels": ["Email"],
                    "contactTemplate": "Bonjour, une faille a été détectée...",
                    "remediationChecklist": ["Fix", "Test", "Deploy"]
                }
            ]
        }
