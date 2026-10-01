import logging
import logging.config
import os

LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s %(levelname)s %(name)s %(message)s",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "standard",
            "stream": "ext://sys.stdout",
        }
    },
    "loggers": {
        "hotel_booking": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
        "uvicorn": {
            "handlers": ["console"],
            "level": LOG_LEVEL,
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console"],
        "level": LOG_LEVEL,
    },
}

logging.config.dictConfig(LOGGING_CONFIG)
logger = logging.getLogger("hotel_booking")
