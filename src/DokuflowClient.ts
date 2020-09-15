import DokuflowModelClient from './DokuflowModelClient';

const dokuflowLaxBaseUrl = 'https://service.dokuflow.com/lax';

type DokuflowClientConfig = {
  spaceName: string;
  apiKey: string;
};

class DokuflowClient {
  constructor(readonly config: DokuflowClientConfig) {}

  model<T>(modelId: string): DokuflowModelClient<T> {
    return new DokuflowModelClient<T>({
      baseUrl: `${dokuflowLaxBaseUrl}/${modelId}`,
      apiKey: this.config.apiKey,
    });
  }
}

export default DokuflowClient;
