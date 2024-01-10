export const generateId = () => {
   const now = new Date();
   const year = now.getFullYear().toString().slice(-2);
   const month = ("0" + (now.getMonth() + 1)).slice(-2);
   const day = ("0" + now.getDate()).slice(-2);
   const hour = ("0" + now.getHours()).slice(-2);
   const minute = ("0" + now.getMinutes()).slice(-2);
   const second = ("0" + now.getSeconds()).slice(-2);
   const randomNumbers = ("0" + Math.floor(Math.random() * 100)).slice(-2);
   return year + month + day + hour + minute + second + randomNumbers;
};
