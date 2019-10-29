interface MessageT {
  id: number;
  time: number;
  userId: number;
  username: string;
  text: string;
  raw: string;
  imgParsed: number;
}

export default MessageT;
