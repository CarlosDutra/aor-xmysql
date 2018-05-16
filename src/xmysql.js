
import {
    fetchUtils,
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    UPDATE_MANY,
    DELETE,
    DELETE_MANY,
} from 'react-admin';
/**
 * Maps admin-on-rest queries to XMYSQL REST API
 * @see https://github.com/o1lab/xmysql
 *
 * @param {string} apiUrl API base URL
 * @param {decorators} Entity decorators/undecorators (ex. composite primary keys should be separated by three underscores)
 * @param {httpClient} HTTP Client
 *
 * @example Decorator example
 * {
 *   'posts': (post) => {
 *     post.id = post.first_key + '___' + post.second_key;
 *     return post;
 *   },
 *   '-jobs': (post) => {
 *     delete post.id;
 *     return post;
 *   }
 * }
 *
 *
 */
export default (apiUrl, httpClient, decorators = {}) => {
    /**
     * @param {string} type Request type, e.g GET_LIST
     * @param {string} resource Resource name, e.g. "posts"
     * @param {Object} payload Request parameters. Depends on the request type
     * @returns {Promise} the Promise for a REST response
     */
    return (type, resource, params) => {
        switch (type) {
            case GET_LIST:
                return httpClient(
                    `${apiUrl}/api/${resource}/count`
                ).then(response => {
                    const rows = parseInt(response.json[0].no_of_rows, 10);

                    if (rows < 1) {
                        return {
                            data: [],
                            total: 0,
                        };
                    }
                    const { page, perPage } = params.pagination;
                    const { field, order } = params.sort;
                    return httpClient(
                        `${apiUrl}/api/${resource}?_p=${page}
                            &_size=${perPage}&_sort=${order === 'DESC'
                            ? '-'
                            : ''}${field}`
                    ).then(response => {
                        return {
                            data: response.json.map(
                                row =>
                                    decorators[resource]
                                        ? decorators[resource](row)
                                        : row
                            ),
                            total: rows,
                        };
                    });
                });
            case GET_ONE:
                return httpClient(
                    `${apiUrl}/api/${resource}/${params.id}`
                ).then(response => {
                    return {
                        data: response.json[0],
                    };
                });
            case GET_MANY:
                return httpClient(
                    `${apiUrl}/api/${resource}/bulk/?_ids=${params.ids.join(',')}`
                ).then(response => {
                    return {
                        data: response.json,
                    };
                });
            case GET_MANY_REFERENCE:
                return httpClient(
                    `${apiUrl}/api/${resource}/count`
                ).then(response => {
                    const rows = parseInt(response.json[0].no_of_rows, 10);
                    if (rows < 1) {
                        return {
                            data: [],
                            total: 0,
                        };
                    }

                    const { page, perPage } = params.pagination;
                    const { field, order } = params.sort;
                    return httpClient(
                        `${apiUrl}/api/${resource}?_p=${page}
                            &_size=${perPage}&_sort=${order === 'DESC'
                            ? '-'
                            : ''}${field}&_where=(${params.target},eq,${params.id})`
                    ).then(response => {
                        return {
                            data: response.json.map(
                                row =>
                                    decorators[resource]
                                        ? decorators[resource](row)
                                        : row
                            ),
                            total: rows,
                        };
                    });
                });
            case UPDATE:
                return httpClient(`${apiUrl}/api/${resource}`, {
                    method: 'PUT',
                    body: JSON.stringify(
                        decorators[`-${resource}`]
                            ? decorators[`-${resource}`](params.data)
                            : params.data
                    ),
                }).then(response => {
                    return {
                        data: response.json,
                    };
                });
            case CREATE:
                return httpClient(`${apiUrl}/api/${resource}`, {
                    method: 'POST',
                    body: JSON.stringify(
                        decorators[`-${resource}`]
                            ? decorators[`-${resource}`](params.data)
                            : params.data
                    ),
                }).then(response => {
                    return {
                        data: response.json,
                    };
                });
            case DELETE:
                return httpClient(`${apiUrl}/api/${resource}/${params.id}`, {
                    method: 'DELETE',
                    body: JSON.stringify(
                        decorators[`-${resource}`]
                            ? decorators[`-${resource}`](params.data)
                            : params.data
                    ),
                }).then(response => {
                    return {
                        data: response.json,
                    };
                });
            default:
                throw new Error(`Unsupported fetch action type ${type}`);
        }
    };
};
