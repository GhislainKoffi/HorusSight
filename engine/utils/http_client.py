import requests
from typing import Optional, Dict, Any


class HTTPClient:
    """HTTP client with session management."""
    
    def __init__(
        self,
        timeout: int = 30,
        user_agent: str = "HorusSight/0.1",
        verify_ssl: bool = True,
        headers: Optional[Dict[str, str]] = None,
        proxy: Optional[str] = None
    ):
        self.timeout = timeout
        self.user_agent = user_agent
        self.verify_ssl = verify_ssl
        self.headers = headers or {}
        self.proxy = proxy
        self._session: Optional[requests.Session] = None
    
    @property
    def session(self) -> requests.Session:
        """Get or create a session."""
        if self._session is None:
            self._session = requests.Session()
            # Set proxy if provided
            if self.proxy:
                self._session.proxies = {"http": self.proxy, "https": self.proxy}
            # Apply default headers to the session
            self._session.headers.update(self._build_headers())
            # Set SSL verification
            self._session.verify = self.verify_ssl
        return self._session
    
    def _build_headers(self) -> Dict[str, str]:
        """Build request headers."""
        headers = {"User-Agent": self.user_agent}
        headers.update(self.headers)
        return headers
    
    def get(self, url: str, params: Optional[Dict[str, Any]] = None, **kwargs) -> requests.Response:
        """
        Perform a GET request. 
        **kwargs allows passing additional requests parameters (cookies, auth, etc.)
        """
        # Ensure timeout is applied if not explicitly overridden in kwargs
        kwargs.setdefault('timeout', self.timeout)
        
        return self.session.get(url, params=params, **kwargs)

    def post(self, url: str, data: Optional[Any] = None, json: Optional[Dict] = None, **kwargs) -> requests.Response:
        """Perform a POST request."""
        kwargs.setdefault('timeout', self.timeout)
        return self.session.post(url, data=data, json=json, **kwargs)

    def close(self):
        """Close the session if it exists."""
        if self._session:
            self._session.close()
            self._session = None