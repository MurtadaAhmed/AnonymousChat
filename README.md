# AnonymousChat (under development)
<p align="center">
  <img src="https://github.com/MurtadaAhmed/AnonymousChat/assets/108568451/fa77aed8-2b77-4d55-b5a1-3a35a085e87c" alt="AnonymousChat" />

</p>

<p align="center">
  

  <h3 align="center">AnonymousChat</h3>

  <p align="center">
    AnonymousChat is a web application that allows users to chat anonymously. It generates anonymous usernames for the users if no name is entered and matches one2one chat based on waiting users in the queue. No registration required. This project is based on Django and Channels.
    <br/>
    <br/>
  
  </p>
</p>

![Contributors](https://img.shields.io/github/contributors/MurtadaAhmed/AnonymousChat?color=dark-green) ![Issues](https://img.shields.io/github/issues/MurtadaAhmed/AnonymousChat) ![License](https://img.shields.io/github/license/MurtadaAhmed/AnonymousChat) 

## Table Of Contents

* [About the Project](#about-the-project)
* [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Installation](#installation)
* [License](#license)
* [Authors](#authors)

## About The Project

AnonymousChat is a web application that allows users to chat anonymously. It generates anonymous usernames for the users if no name is entered and matches one2one chat based on waiting users in the queue. No registration required. This project is based on Django and Channels.

## Built With

Python with Django framework, Channels and Daphne Asgi server, JavaScript.

## Getting Started
<img src="https://github.com/MurtadaAhmed/AnonymousChat/assets/108568451/fa77aed8-2b77-4d55-b5a1-3a35a085e87c" alt="AnonymousChat" />

![image](https://github.com/MurtadaAhmed/AnonymousChat/assets/108568451/d96bd2be-1991-4faf-83d1-58e5400a8fae)

![image](https://github.com/MurtadaAhmed/AnonymousChat/assets/108568451/0155bbfb-ea1e-43d0-8612-f94f3a30bc52)

![image](https://github.com/MurtadaAhmed/AnonymousChat/assets/108568451/72bdcdfe-750f-4258-827e-d2680d24a225)

### Installation

A. To run the AnonymousChat application locally, follow these steps:

// These steps suggests that you already have Python installed

1. Clone the repo

```sh
git clone https://github.com/MurtadaAhmed/AnonymousChat.git
```

2. Create a virtual environment and activate it (optional but recommended):

```sh
python -m venv venv
source venv/bin/activate # On Windows, use venv\Scripts\activate
```

3. Install the required dependencies:

```
pip install -r requirements.txt
```

4. Run the development server:
```
python manage.py runserver
```

AnonymousChat should now be accessible at http://localhost:8000/.

B. To deploy the application on production environment:
The included web.config file contains the basic setup for Windows Server IIS server.

Requirements:
- requirements.txt
- IIS web server
- Websocket to be installed from Windows Server 2022 Server Manager

## License

Distributed under the MIT License.

## Authors

* **Murtada Ahmed** - *Junior Python Web Developer* - [Murtada Ahmed](https://github.com/MurtadaAhmed) 
