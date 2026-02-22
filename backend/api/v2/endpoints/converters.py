from fastapi import APIRouter

from route.v2.docs_converter import router as docs_converter_router
from route.v2.docx_to_pdf_converter import router as docx_to_pdf_converter_router
from route.v2.excel_converter import router as excel_converter_router
from route.v2.excel_to_pdf_converter import router as excel_to_pdf_converter_router
from route.v2.image_to_pdf_converter import router as image_to_pdf_converter_router
from route.v2.pdf_page_remover import router as pdf_page_remover_router
from route.v2.remove_background import router as remove_background_router

router = APIRouter()

router.include_router(excel_converter_router)
router.include_router(docs_converter_router)
router.include_router(docx_to_pdf_converter_router)
router.include_router(excel_to_pdf_converter_router)
router.include_router(image_to_pdf_converter_router)
router.include_router(pdf_page_remover_router)
router.include_router(remove_background_router)
