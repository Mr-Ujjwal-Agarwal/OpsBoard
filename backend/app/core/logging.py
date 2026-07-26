"""
Logging configuration.

Configures a consistent, structured log format across the application so
logs are easy to parse both locally (stdout) and later when aggregated by
a cluster-level logging stack.
"""

import logging
import sys

from app.config.settings import get_settings


def configure_logging() -> None:
    """Configure root logging handlers and format for the whole application."""
    settings = get_settings()

    log_format = (
        "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
    )

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=log_format, datefmt="%Y-%m-%dT%H:%M:%S%z"))

    root_logger = logging.getLogger()
    root_logger.setLevel(settings.log_level.upper())

    # Avoid duplicate handlers on reload.
    root_logger.handlers.clear()
    root_logger.addHandler(handler)

    # Quiet down noisy third-party loggers unless we're in debug mode.
    noisy_loggers = ("uvicorn.access", "sqlalchemy.engine")
    for logger_name in noisy_loggers:
        logging.getLogger(logger_name).setLevel(
            "INFO" if settings.debug else "WARNING"
        )


def get_logger(name: str) -> logging.Logger:
    """Return a module-scoped logger."""
    return logging.getLogger(name)
