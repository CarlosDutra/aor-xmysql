# aor-xmysql
[Xmysql](https://github.com/o1lab/xmysql) REST Client for [admin-on-rest](https://github.com/marmelab/admin-on-rest), the frontend framework for building admin applications on top of REST services.


## Installation

aor-xmysql is available from npm. You can install it using:

```sh
npm install --save-dev aor-xmysql
```
It can also be installed using yarn:
```sh
yarn add aor-xmysql
```

## Usage

```js
// in App.js
import XmysqlClient from 'aor-xmysql';

...

    <Admin restClient={XmysqlClient('http://my.api.url/api')} ...>
```

## License

This module is licensed under the [MIT Licence](LICENSE).
