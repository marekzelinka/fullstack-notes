export const middleware = {
  unknownEndpoint: (_req, res) => {
    res.status(404).send({ detail: "Unknown endpoint" });
  },
  _MUST_BE_LAST_errorHandler: (err, _req, res, _next) => {
    console.error(err.stack);

    res.status(500).json({ error: err.message ?? "Internal Server Error" });
  },
};
