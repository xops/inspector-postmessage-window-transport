import { Connect, SendData } from "../__GENERATED_TYPES__";
import PostMessageWindowTransport from "../transports/PostMessageWindowTransport";

export interface IMethodMapping {
  [methodName: string]: (...params: any) => Promise<any>;
}

let transport: PostMessageWindowTransport | undefined;
let internalID = 0;

const connect: Connect = async (uri) => {
  transport = new PostMessageWindowTransport(uri);
  await transport.connect();
  return true;
};

const sendData: SendData = (data) => {
  if (!transport) {
    throw new Error("Not Connected");
  }
  return transport.sendData({
    internalID: internalID++,
    request: data,
  });
};

const methodMapping: IMethodMapping = {
  connect,
  sendData,
};

export default methodMapping;
