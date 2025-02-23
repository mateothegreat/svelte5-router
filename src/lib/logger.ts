const randomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

export const logger = {
  debug: (id: string, msg: string, data?: any) => {
    console.log(
      '%c[Router ID:%c%s] %c%s',
      'color: #4CAF50;',
      'color: #EFC703; font-weight: bold',
      id,
      "color: #757575",
      msg,
      data || ''
    );
  }
};
