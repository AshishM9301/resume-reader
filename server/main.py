from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from helpers import cors, log, rate_limitter, router, static
from helpers.lifespan import lifespan

# Setup logging 
log.setup()

# Setup FastAPI app
app = FastAPI(lifespan=lifespan)

# Setup rate limiter
rate_limitter.setup(app)

# Setup CORS
cors.setup(app)

# Setup routers
router.setup(app)

# Setup static files
static.setup(app)