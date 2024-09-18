import {Events, WebApplication} from "../index.js";


const _app = new WebApplication("local", "api");

const _robert = _app.addNamespace("roberts");

const _company = _robert.addResource("company");
const _employee = _company.addResource("employee");
const _termination = _employee.addAction("termination");

_termination.on(Events.action.execute.On, async (context) => {
    // Going to fire an employee at a company.
});

_app.start()
    .then((app) => {
        //
    })
    .catch((error) => {
        //
    });