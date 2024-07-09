# arcwell
Arcwell Digital Medicine Platform


## Architecture Overview
Arcwell is built in a model following a Client-Server approach where:

* the **Server** is an individual "Arcwell Node" that contains business logic, data modeling, and interoperability configuration with other systems
* the **Client** is first developed as a set of Client SDKs and libraries that allow the implementation of custom client applications which "speak Arcwell."
* the Server also provides an **Admin Dashboard** which provides the interface for configuration, modification of trials, and access to data

This means that a representative end-user application or an **"Arcwell Application"** will be a separate entity that leverages the Client libraries to connect to Arcwell.

![Arcwell high-level architecture concept](./arch_hl_2024.png)

