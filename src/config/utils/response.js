export const resSuccess = (status, message, payload = {}) => {
   return { status: status, success: true, message: message, payload: payload };
};

export const resFail = (status, message, payload = {}) => {
   return { status: status, success: false, message: message, payload: payload };
};

export const response = (res, payload) => {
   const { status, ...strippedPayload } = payload;
   res.status(payload.status).json(strippedPayload);
};
