"""
FastAPI has OpenAPI/Swagger built-in at /docs and /redoc.
This file provides a custom configuration to enhance those pages.

Apply by importing and calling configure_swagger(app) in your main.py.
"""

from fastapi import FastAPI


def configure_swagger(app: FastAPI) -> None:
    """Enhance the built-in FastAPI Swagger/OpenAPI docs."""
    app.title = "API Documentation"
    app.description = "Auto-generated API docs by Kybernus"
    app.version = "1.0.0"
    app.docs_url = "/api/docs"
    app.redoc_url = "/api/redoc"
    app.openapi_url = "/api/openapi.json"

    print("📄 Swagger docs available at /api/docs")
    print("📄 ReDoc available at /api/redoc")
