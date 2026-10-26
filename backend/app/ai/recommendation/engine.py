import logging
from app.ai.retrievers.hybrid import HybridRetriever
from app.ai.models.llm_service import LLMService
from app.ai.prompts.manager import PromptManager
from app.models.scheme import Scheme

logger = logging.getLogger("ai.recommendation")

class RecommendationEngine:
    def __init__(self, db_session):
        self.db = db_session
        self.retriever = HybridRetriever()
        self.llm = LLMService()
        self.prompts = PromptManager()
        
    def recommend(self, profile: dict, query: str) -> str:
        logger.info("Starting recommendation pipeline...")
        
        # Fetch basic schemes based on structured filtering
        db_query = self.db.query(Scheme).filter(Scheme.status == "Active")
        
        if profile.get('income') is not None:
            db_query = db_query.filter((Scheme.income_limit == None) | (Scheme.income_limit >= profile['income']))
            
        if profile.get('age') is not None:
            db_query = db_query.filter((Scheme.age_limit_min == None) | (Scheme.age_limit_min <= profile['age']))
            db_query = db_query.filter((Scheme.age_limit_max == None) | (Scheme.age_limit_max >= profile['age']))
            
        if profile.get('occupation'):
            db_query = db_query.filter((Scheme.beneficiary_type == None) | (Scheme.beneficiary_type.ilike(f"%{profile['occupation']}%")))

        schemes = db_query.limit(5).all()
        scheme_context = "\n".join([f"- {s.name}: {s.description}" for s in schemes])
        
        # 2. Semantic Search (Optional fallback/augmentation)
        try:
            docs = self.retriever.search(query)
            doc_context = " ".join([d.page_content for d in docs]) if docs else ""
        except Exception:
            doc_context = ""
            
        context = f"Eligible Schemes:\n{scheme_context}\n\nAdditional Info:\n{doc_context}"
        
        # 3. Prompting & LLM Generation
        occupation = profile.get('occupation', 'citizen').lower()
        prompt = self.prompts.get_prompt(occupation, context, query)
        try:
            response = self.llm.generate(prompt)
        except Exception as e:
            logger.warning(f"Ollama/LLM generation unavailable: {e}")
            response = "AI Scheme Advisor is currently offline (local Ollama service is unavailable). However, all Telangana government scheme listings, eligibility criteria, applications, document uploads, and tracking remain fully operational."
        
        return response
