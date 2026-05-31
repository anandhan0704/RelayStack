# RelayStack MTA

Local Haraka-based MTA for RelayStack email development.

This first MTA mode accepts SMTP submissions from the local API on port `2525` and captures `.eml` files under:

```text
apps/mta/var/spool
```

It does not yet perform public internet delivery. The next stages are DKIM signing, outbound queue delivery, bounce processing, suppression lists, and reputation controls.

