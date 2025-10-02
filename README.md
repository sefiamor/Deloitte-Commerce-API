#  Deloitte Commerce API


Deloitte Commerce API is a modern, production-ready e-commerce backend designed to power online storefronts and omnichannel retail
experiences. It provides RESTful endpoints for catalog management, carts, checkout, orders, and customer profiles, and is built for 
scalability, security, and easy integration with third-party services such as payment gateways, shipping providers, and analytics platforms. 
With clear API documentation, built-in support for multi-warehouse inventory, promotions and pricing rules, and observability for monitoring 
and performance, Deloitte Commerce API enables development teams to deloittecommerce fast, reliable shopping experiences across web and mobile channels.




> **Note:**
> While inspired by the [OWASP API Top 10](https://owasp.org/www-project-api-security/), it is not my intention to provide a comprehensive set of examples for all vulnerabilities in the top 10. If you are looking for such examples, I recommend you take a look at following awesome projects that are great learning resources:


## Demo Scenario

The Deloitte Commercew API provides the backend for an e-Commerce shop. The API comes pre-loaded with 20 products, 1000 users and over 2000 orders. 

Via the API you can create and manage a user account, query products, query and create orders. The API also provides administrator users the ability to manage user accounts.

## Installation

### Using the pre-built image

Simply use the `docker-compose.yml` file from the root of this repository. 

Make sure your Docker environment is good to go. This will depend on how you've installed Docker onto your machine (e.g. [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Rancher Desktop](https://rancherdesktop.io/), [Colima](https://github.com/abiosoft/colima)) and start the docker-compose stack. 

```bash
docker-compose up -d
```

The stack will pull the `mongodb`, `mongo-express` and `sefiamor/deloitte-commerce-api` images from [Docker Hub](https://hub.docker.com) and seed the database with sample data.

### Building from source

First, clone this repository so you have a local working copy. 

```bash
git clone git@github.com:sefiamor/deloitte-commerce-api.git
cd deloitte-commerce-api
```

When you wish to build the `sefiamor/deloitte-commerce-api` image locally, simply uncomment the build instructions in the [docker-compose.yml](docker-compose.yml) file.

```yaml
services:
  ...
  deloitte-commerce-api:
    build:
      context: .
  ...
```

Make sure your Docker environment is good to go. This will depend on how you've installed Docker onto your machine (e.g. [Docker Desktop](https://www.docker.com/products/docker-desktop/), [Rancher Desktop](https://rancherdesktop.io/), [Colima](https://github.com/abiosoft/colima)) and start the docker-compose stack. 

```bash
docker-compose up -d
```

The stack will pull the `mongodb` and `mongo-express` images from [Docker Hub](https://hub.docker.com), seed the database with sample data, and build the `sefiamor/deloitte-commerce-api` image locally. 

### Once installed

Following services are accessible from your localhost with the default configuration provided:

- Mongo DB on port 27017
- [Mongo Express](https://github.com/mongo-express/mongo-express) on port 8081
- deloittecommerce API on port 3333



### 1. Excessive data exposure in JWT token

If an attacker can obtain a valid token (e.g. via Cross-Site Scripting), they can get lots of user info from the token payload (including the hashed password). The scale at which this can scenario is small and would enable an attacker to compromise a single account. It would have to be combined with e.g. phishing attempts to enable the execution of malicious code while accessing the API. 

### 2. Security misconfiguration (verbose error messages) in login

A failed login attempt returns verbose error messages (user unknown vs wrong password). This makes it easy for attackers to cross-reference email lists to build a list of user accounts. This scenario enables the attacker to target a larger scale as lists of email addresses from other leaks are available on the Dark Web. A great tool for raising awareness around leaked account info is [Have I Been Pwned?](https://haveibeenpwned.com/).

### 3. Broken Object-level Authorization in order controller

An attacker can sign up for their own account. The BOLA vulnerability in the order endpoint of the API enables the attacker to fetch all orders by simply enumerating the order number. The order info contains account information which enables the attacker to build a complete list of user accounts to attack.

### 4. Lack of rate limiting enables brute forcing password reset

Once the email address for a user account is known, an attacker can brute force the four digit one-time password and reset the password. From that point onwards the user account is compromised and any user data is accessible to the attacker.

### 5. Mass assignment enables you to sign up as an administrator

The admin role is assigned to user accounts via a hidden property on the user object. An attacker can sign up as admin and access any and all user account information via the admin API. 

