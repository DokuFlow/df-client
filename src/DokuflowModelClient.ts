import Axios, { AxiosResponse } from 'axios';

export type DokuflowDocument<T> = {
  ID: string;
} & T;

export type Operation = 'LIKE' | 'EQ' | 'IN';

export type FilterOperation<T, K extends keyof T> =
  | {
      field: K;
      operation: 'LIKE' | 'EQ';
      value: T[K];
    }
  | {
      field: K;
      operation: 'IN';
      value: T[K][];
    };

export type GetListOptions<T, S extends keyof T> = {
  selections?: S[];
  filters?: FilterOperation<T, keyof T>[];
};

export type GetListResponse<T, S extends keyof T> = Promise<
  AxiosResponse<Pick<T, S>[]>
>;

export type MutationResponse<T> = {
  isSuccess: boolean;
  message: string;
  validationResult?: Record<keyof T, string>;
  result: T;
};

type DokuflowModelClientConfig = {
  baseUrl: string;
  apiKey: string;
};

class DokuflowModelClient<T> {
  constructor(readonly config: DokuflowModelClientConfig) {}

  getBaseUrl = (documentId?: string) => {
    if (documentId) {
      return `${this.config.baseUrl}/${documentId}?apiKey=${this.config.apiKey}`;
    }
    return `${this.config.baseUrl}?apiKey=${this.config.apiKey}`;
  };

  get(documentId: string): Promise<AxiosResponse<DokuflowDocument<T>>> {
    return Axios.get(this.getBaseUrl(documentId));
  }

  getList<S extends keyof DokuflowDocument<T>>(
    options: GetListOptions<DokuflowDocument<T>, S>
  ): GetListResponse<DokuflowDocument<T>, S> {
    let url = this.getBaseUrl();

    if (options.filters) {
      const filterQueryString = [];
      for (const filter of options.filters) {
        switch (filter.operation) {
          case 'IN':
            filterQueryString.push(
              `$$${filter.field}=${filter.operation}||${filter.value.join('%')}`
            );
            break;
          default:
            filterQueryString.push(
              `$$${filter.field}=${filter.operation}||${filter.value}`
            );
            break;
        }
      }

      if (filterQueryString.length) {
        url += '&' + filterQueryString.join('&');
      }
    }

    if (options.selections && options.selections.length) {
      url += `&select=${options.selections.join(',')}`;
    }

    return Axios.get(url);
  }

  async getFirst<S extends keyof DokuflowDocument<T>>(
    options: GetListOptions<DokuflowDocument<T>, S>
  ) {
    const listResponse = await this.getList(options);
    if (
      listResponse.data &&
      Array.isArray(listResponse.data) &&
      listResponse.data.length < 1
    ) {
      return null;
    }

    return listResponse.data[0];
  }

  create(
    model: Partial<T>
  ): Promise<AxiosResponse<MutationResponse<DokuflowDocument<T>>>> {
    return Axios.post(this.getBaseUrl(), model);
  }

  update(
    model: Pick<DokuflowDocument<T>, 'ID'> &
      Partial<Omit<DokuflowDocument<T>, 'ID'>>
  ): Promise<AxiosResponse<MutationResponse<DokuflowDocument<T>>>> {
    const { ID, ...modelContent } = model;
    return Axios.patch(this.getBaseUrl(ID), modelContent);
  }

  delete(
    modelId: string
  ): Promise<AxiosResponse<MutationResponse<DokuflowDocument<T>>>> {
    return Axios.delete(this.getBaseUrl(modelId));
  }
}

export default DokuflowModelClient;
