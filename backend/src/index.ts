import { startupValidation } from "./pre-start";
import app from "./Server";
import logger from "./shared/Logger";
import { config } from "./config/config";
import { SERVER_STARTED } from "./shared/constants";

startupValidation.then(() => {
  app.listen(config.port, () => {
    console.log(SERVER_STARTED + config.port);
    logger.info(SERVER_STARTED + config.port);
  });
});
