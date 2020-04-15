import { Transport } from "@open-rpc/client-js/build/transports/Transport";
import { JSONRPCRequestData, IJSONRPCData } from "@open-rpc/client-js/build/Request";
import { JSONRPCError } from "@open-rpc/client-js";

class PostMessageWindowTransport extends Transport {
  public uri: string;
  public window: any;
  public frame: undefined | null | Window;

  constructor(uri: string) {
    super();
    this.uri = uri;
  }
  public connect(): Promise<any> {
    const urlRegex = /^(http|https):\/\/.*$/;
    return new Promise((resolve, reject) => {
      if (!urlRegex.test(this.uri)) {
        reject(new Error("Bad URI"));
      }
      this.frame = window.open(this.uri, "_blank");
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
  }

  public async sendData(data: JSONRPCRequestData, timeout: number | undefined = 5000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.frame) {
        return;
      }
      this.frame.postMessage((data as IJSONRPCData).request, this.uri);
      const handleMessage = (ev: MessageEvent) => {
        if (ev.origin === window.origin) {
          return;
        }
        window.removeEventListener("message", handleMessage);
        if (ev.data.error) {
          reject(new JSONRPCError(ev.data.error.message, ev.data.error.code, ev.data.error.data));
        }
        if (ev.data.id === (data as IJSONRPCData).request.id) {
          resolve(ev.data.result);
        }
      };
      window.addEventListener("message", handleMessage, false);
    });
  }

  public close(): void {
    if (this.frame) {
      this.frame.close();
    }
  }
}

export default PostMessageWindowTransport;
