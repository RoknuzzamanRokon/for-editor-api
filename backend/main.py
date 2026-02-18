from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from route.home import router as home_router
from route.excel_converter import router as excel_converter_router
from route.docs_converter import router as docs_converter_router
from route.docx_to_pdf_converter import router as docx_to_pdf_converter_router
from route.image_to_pdf_converter import router as image_to_pdf_converter_router

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
app.include_router(image_to_pdf_converter_router)
