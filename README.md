# QLDB Access Control Demo

When QLDB was first launched, it provided a set of actions for interacting with the control plane API to manage ledgers [(see here)](https://docs.aws.amazon.com/qldb/latest/developerguide/API_Operations.html), but only a single action for interacting with a ledger using the data plane API. This meant that any user or role required the `qldb:sendCommand` permission for issuing a `PartiQL` statement against a ledger. With this IAM permission, you were able to execute all `PartiQL` commands from simple lookups, to mutating state with updates and deletes, and querying all revision history.

The latest release from the Amazon QLDB team provides support for fine-grained IAM permissions when interacting with a ledger, which helps enforce least-privilege. This repository will show you how to get started, using the `QLDB Shell`.

There are two steps involved:

1) Setup the ledger and associated roles and test out the new controls. See the [readme](/shell-demo) file.
2) Once complete, check out some of the more advanced permissions. See the [readme](/table-demo) file.
