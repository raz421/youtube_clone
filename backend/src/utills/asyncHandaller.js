const asyncHandaller = (requestHandaller) => {
  return (req, res, next) => {
   Promise.resolve(requestHandaller(req, res, next)).catch((e) => {
      next(e);
    });
  };
};
export { asyncHandaller };

// const asyncHandaller = (fn) => async (req, res, next) => {
//   try {
//     await fn(req, res, next);
//   } catch (e) {
//     res.status(e.code || 500).json({
//       success: false,
//       message: e.message,
//     });
//   }
// };
