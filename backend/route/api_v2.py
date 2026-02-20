"""
API v2 router - auth required
"""
from fastapi import APIRouter, Depends

from route.require_auth import require_auth
from route.home import router as home_router
from route.excel_converter import router as excel_converter_router
from route.docs_converter import router as docs_converter_router
from route.docx_to_pdf_converter import router as docx_to_pdf_converter_router
from route.excel_to_pdf_converter import router as excel_to_pdf_converter_router
from route.image_to_pdf_converter import router as image_to_pdf_converter_router
from route.pdf_page_remover import router as pdf_page_remover_router
from route.remove_background import router as remove_background_router


router = APIRouter(prefix="/api/v2", dependencies=[Depends(require_auth)])

router.include_router(home_router)
router.include_router(excel_converter_router)
router.include_router(docs_converter_router)
router.include_router(docx_to_pdf_converter_router)
router.include_router(excel_to_pdf_converter_router)
router.include_router(image_to_pdf_converter_router)
router.include_router(pdf_page_remover_router)
router.include_router(remove_background_router)
