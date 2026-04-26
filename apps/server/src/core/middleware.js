export const middleware = {
  unknownEndpoint: (_req, res) => {
    res.status(404).send({ detail: "Unknown endpoint" });
  },
  _MUST_BE_LAST_errorHandler: (error, _req, res, next) => {
    console.error(error.message);

    if (error.name === "CastError") {
      res.status(400).json({ error: "Malformatted id" });

      return;
    }

    next(error);
  },
};
