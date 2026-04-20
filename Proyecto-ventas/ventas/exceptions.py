from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is None:
        return Response(
            {
                "ok": False,
                "message": "Error interno del servidor",
                "errors": [],
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    detail = response.data
    if isinstance(detail, dict):
        if "detail" in detail:
            message = str(detail["detail"])
            errors = []
        else:
            message = "Error de validacion"
            errors = detail
    elif isinstance(detail, list):
        message = "Error de validacion"
        errors = detail
    else:
        message = str(detail)
        errors = []

    response.data = {
        "ok": False,
        "message": message,
        "errors": errors,
    }
    return response
