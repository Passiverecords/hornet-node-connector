# hornet-node-connector
Dernier Cri - Hornet WS - Node Connector

# Usage
```js
	const hornet = await new hornet({
		url: process.env.REDIS_URL
	})
```

```js
hornet.publish(
	session_uuid,
	'event:type',
	body,
	{
		except: uuid to except
	}
)
```
