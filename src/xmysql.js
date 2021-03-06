import {
    GET_LIST,
    GET_ONE,
    GET_MANY,
    GET_MANY_REFERENCE,
    CREATE,
    UPDATE,
    DELETE
} from 'admin-on-rest/lib/rest/types';
import { fetchJson } from 'admin-on-rest/lib/util/fetch';

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
export default (apiUrl, decorators = {}, httpClient = fetchJson) => {
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
                    `${apiUrl}/${resource}/count`
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
                        `${apiUrl}/${resource}?_p=${page}
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
                    `${apiUrl}/${resource}/${params.id}`
                ).then(response => {
                    return {
                        data: response.json[0],
                    };
                });
            case GET_MANY:
                return httpClient(
                    `${apiUrl}/${resource}/bulk/?_ids=${params.ids.join(',')}`
                ).then(response => {
                    return {
                        data: response.json,
                    };
                });
            case GET_MANY_REFERENCE:
                return httpClient(
                    `${apiUrl}/${resource}/count`
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
                        `${apiUrl}/${resource}?_p=${page}
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
                return httpClient(`${apiUrl}/${resource}`, {
                    method: 'PUT',
                    body: JSON.stringify(
                        decorators[`-${resource}`]
                            ? decorators[`-${resource}`](params.data)
                            : params.data
                    ),
                }).then(response => {
                	body: JSON.stringify(
                        decorators[`-${resource}`]
                            ? decorators[`-${resource}`](params.data)
                            : params.data
                    )
                    return {
                        data: params.data,
                    };
                });
            case CREATE:
           	 	console.log("params.data")
                console.log(params.data)
                return httpClient(`${apiUrl}/${resource}`, {
                    method: 'POST',
                    body: JSON.stringify(
                        decorators[`-${resource}`]
                            ? decorators[`-${resource}`](params.data)
                            : params.data
                    ),
                }).then(response => {
                    return {
                        data: response.data,
                    };
                });
            case DELETE:
                return httpClient(`${apiUrl}/${resource}/${params.id}`, {
                    method: 'DELETE',
                    body: JSON.stringify(
                        decorators[`-${resource}`]
                            ? decorators[`-${resource}`](params.data)
                            : params.data
                    ),
                }).then(response => {
                    return {
                        data: params.data,
                    };
                });
            case DELETE_MANY:
           	 	console.log("params.id")
                console.log(params.id)
                for (delete_id in params.id) {
                    console.log("delete_id")
                    console.log(delete_id)
                    return httpClient(`${apiUrl}/${resource}/${delete_id}`, {
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
                }
                break;
            default:
                //throw new Error(`Não permitido: ${type} 003`);
        }
    };
};
