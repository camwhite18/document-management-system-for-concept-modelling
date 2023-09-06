# International Relations Named Entity Recognition

### Project Structure

The project is split into two main parts: the API and the UI. The API is responsible for handling the requests from the UI and
communicating with the NER model. The UI is responsible for displaying the data to the user and handling the user's interactions
with the application.

The project is split into the following directories:

- **nginx**: This directory contains the configuration for the nginx server that is used to serve the API.
- **web/api**: This directory contains the code for the API.
- **web/frontend**: This directory contains the code for the UI.
- **notebooks**: This directory contains the notebooks used to train the NER model and topic modelling model.

### First steps

Before this project can be run, you need to unzip the NER model file. To do so, you need to run the following command:

```bash
make unzip
```

### How to run

The best way to run this project is through using Docker. To do so, you need to have Docker installed on your machine. 
If you don't have it, you can download it [here](https://www.docker.com/products/docker-desktop).

Once you have Docker installed, you can run the following command to build the image:

```bash
make build
```

This will build the image and install all the dependencies. Once the image is built, you can run the following command 
to run the project:

```bash
make run
```

This will run the project, and you can access it through the following URL: [http://localhost:80](http://localhost:80).

### How to use the application

Upon navigating to [http://localhost:80](http://localhost:80), you will be presented with a landing page asking you to login.
You can use the following credentials to login:

```
username: admin
password: admin
```

Once you are logged in, you can utilise the full functionality of the application. The navbar at the top allows you to 
navigate to the different pages of the application. The following pages are available:

- **Home**: This is the landing page of the application. It contains the user's recent activity.
- **Browser**: This page allows the user to browse the different projects and documents that are available to them in the application.
- **Submit**: This page allows the user to create new projects and upload new documents to the application to be labelled asynchronously by the NER model.
- **Quick Tag**: This page allows you to quickly tag a document using the NER model.

The steps to add a document to the application are as follows:

1. Navigate to the **Submit** page.
2. Either create a new project or select an existing project.
3. Enter a name for the document.
4. Enter the text of the document.
5. Click the **Submit** button.
6. The document will be added to the application and will be available to be viewed on the **Browser** page.
7. The document will be processed by the NER model and the results will be available to view on the **Browser** page (note this can take a few minutes if demand is high).

In order to add additional users and control existing users permissions, you can navigate to the Django admin page at the following URL: [http://localhost:80/admin/](http://localhost:80/admin/).

### How to run the tests

To run the tests, you need to run the following command:

```bash
make test
```

Alternatively, the tests for the API and the UI can be run separately by running the following commands:

```bash
make test-api
make test-ui
```
