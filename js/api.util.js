import { CSRF_HEADER } from "$lib/variables";
import { get } from "svelte/store";
import { page } from "$app/stores";

export const NETWORK_ERROR = "NETWORK_ERROR";

const ApiUtil = {
  get({ path, request, CSRFToken }) {
    return this.customRequest({ path, request, CSRFToken });
  },

  post({ path, request, body, headers, CSRFToken }) {
    const isBodyFormData = body instanceof FormData;

    return this.customRequest({
      path,
      data: {
        method: "POST",
        credentials: "include",
        body: isBodyFormData ? body : JSON.stringify(body || {}),
        headers: isBodyFormData
          ? headers
          : {
              "Content-Type": "application/json",
              ...headers,
            },
      },
      request,
      CSRFToken,
    });
  },

  put({ path, request, body, headers, CSRFToken }) {
    const isBodyFormData = body instanceof FormData;

    return this.customRequest({
      path,
      data: {
        method: "PUT",
        credentials: "include",
        body: isBodyFormData ? body : JSON.stringify(body || {}),
        headers: isBodyFormData
          ? headers
          : {
              "Content-Type": "application/json",
              ...headers,
            },
      },
      request,
      CSRFToken,
    });
  },

  delete({ path, request, headers, CSRFToken }) {
    return this.customRequest({
      path,
      data: {
        method: "DELETE",
        headers,
      },
      request,
      CSRFToken,
    });
  },

  async customRequest({ path, data = {}, request, CSRFToken }) {
    const CSRFHeader = {};

    if (!CSRFToken) {
      let session;

      if (request) {
        const parentData = await request.parent();

        const { session: parentSession } = parentData;

        session = parentSession;
      } else {
        const { session: pageSession } = get(page).data;

        session = pageSession;
      }

      CSRFToken = get(session).CSRFToken;
    }

    if (CSRFToken) CSRFHeader[CSRF_HEADER] = CSRFToken;

    const input = {
      ...data,
      headers: CSRFToken ? { ...data.headers, ...CSRFHeader } : data.headers,
    };

    const fetchRequest =
      request && request.fetch
        ? request.fetch(path, input)
        : fetch(path, input);

    return fetchRequest
      .then((r) => r.text())
      .then((json) => {
        try {
          return JSON.parse(json);
        } catch (err) {
          return json;
        }
      });
  },
};

export default ApiUtil;
