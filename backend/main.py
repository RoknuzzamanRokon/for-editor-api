from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from route.home import router as home_router
from route.excel_converter import router as excel_converter_router
from route.docs_converter import router as docs_converter_router
from route.docx_to_pdf_converter import router as docx_to_pdf_converter_router
from route.excel_to_pdf_converter import router as excel_to_pdf_converter_router
from route.image_to_pdf_converter import router as image_to_pdf_converter_router
from route.pdf_page_remover import router as pdf_page_remover_router
from route.remove_background import router as remove_background_router

app = FastAPI()

# Add CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(home_router)
app.include_router(excel_converter_router)
app.include_router(docs_converter_router)
app.include_router(docx_to_pdf_converter_router)
app.include_router(excel_to_pdf_converter_router)
app.include_router(image_to_pdf_converter_router)
app.include_router(pdf_page_remover_router)
app.include_router(remove_background_router)
