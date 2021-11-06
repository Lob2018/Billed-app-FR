import { getByTestId, getByText, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage";
import firebase from "../__mocks__/firebase.js";
import Router from "../app/Router";

import { fireEvent } from "@testing-library/dom";


describe("Given I am connected as an employee", () => {

    // #3 composant container/NewBill
    describe("When I am on NewBill Page", () => {
        test("Then the new bill's form should be loaded with its fields", () => {
            const html = NewBillUI()
            document.body.innerHTML = html
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();
            expect(screen.getByTestId("expense-type")).toBeTruthy();
            expect(screen.getByTestId("expense-name")).toBeTruthy();
            expect(screen.getByTestId("datepicker")).toBeTruthy();
            expect(screen.getByTestId("amount")).toBeTruthy();
            expect(screen.getByTestId("vat")).toBeTruthy();
            expect(screen.getByTestId("pct")).toBeTruthy();
            expect(screen.getByTestId("commentary")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();
            expect(screen.getByRole("button")).toBeTruthy();
        })
        describe("When I upload an image in file input", () => {
            test("Then one file should be uploaded without error", () => {
                // define the window object localStorage
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                // define the user's object property
                const user = JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                });
                // set localStorage user's type as Employee with email
                window.localStorage.setItem('user', user);
                // define the window object location to the employee's new bill
                Object.defineProperty(window, 'location', {
                    value: {
                        pathname: '/',
                        hash: '#employee/bill/new',
                    },
                });
                // needed for the router object
                document.body.innerHTML = `<div id="root"></div>`;
                // call the router to route to #employee/bill/new
                Router();

                const file = new File(['image.jpeg'],
                    'image.jpeg', { type: 'image/jpeg' });
                const changeFile = fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });

                const input = screen.getByTestId("file")
                expect(input.files[0]).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
                expect(input.files[0].name).toBe('image.jpeg');
                expect(changeFile).toBeTruthy();
                expect(input.classList.contains('is-invalid')).toBe(false)
            })
        })
        describe("When I upload something other than an image in file input", () => {
            test("Then one file should be uploaded with an error", () => {
                // define the window object localStorage
                Object.defineProperty(window, 'localStorage', { value: localStorageMock });
                // define the user's object property
                const user = JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                });
                // set localStorage user's type as Employee with email
                window.localStorage.setItem('user', user);
                // define the window object location to the employee's new bill
                Object.defineProperty(window, 'location', {
                    value: {
                        pathname: '/',
                        hash: '#employee/bill/new',
                    },
                });
                // needed for the router object
                document.body.innerHTML = `<div id="root"></div>`;
                // call the router to route to #employee/bill/new
                Router();

                const file = new File(['document.pdf'],
                    'document.pdf', { type: 'application/pdf' });
                const changeFile = fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });

                const input = screen.getByTestId("file")
                expect(input.files[0]).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
                expect(input.files[0].name).toBe('document.pdf');
                expect(changeFile).toBeTruthy();
                expect(input.classList.contains('is-invalid')).toBe(true)
            })
        })
        describe("When I submit the form completed", () => {
            test("Then the bill is created", async() => {

                Object.defineProperty(window, 'location', {
                    value: {
                        pathname: '/',
                        hash: '#employee/bill/new',
                    },
                });

                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                }))

                document.body.innerHTML = `<div id="root"></div>`;

                Router();

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                }
                const newBill = new NewBill({
                    document,
                    onNavigate,
                    firestore: null,
                    localStorage: window.localStorage
                })

                // const html = NewBillUI()

                // document.body.innerHTML = html

                const handleSubmit = jest.fn((e) => newBill.handleSubmit());

                const file = new File(['(⌐□_□)'], 'test.jpg', { type: 'test/jpg' })

                fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });

                const dataURL = screen.getByTestId('file').files[0].src
                expect(dataURL).toMatchSnapshot(
                    'data url in the image-preview src for this string: "(⌐□_□)"',
                )

                const changeFile = fireEvent.change(screen.getByTestId("file"), { target: { files: [file] } });
                expect(changeFile).toBeTruthy();

                newBill.fileUrl = dataURL;

                const validBill = {
                    type: "Equipement et matériel",
                    name: "Clavier-test",
                    date: "2021-10-20",
                    amount: 10,
                    vat: 10,
                    pct: 10,
                    commentary: "Test",
                    fileUrl: dataURL,
                    fileName: "test.jpg",
                    email: "azerty@email.com",
                    status: "pending"
                };


                // Load the values in fields
                screen.getByTestId("expense-type").value = validBill.type;
                screen.getByTestId("expense-name").value = validBill.name;
                // ISO 8601
                screen.getByTestId("datepicker").value = validBill.date;
                screen.getByTestId("amount").value = validBill.amount;
                screen.getByTestId("vat").value = validBill.vat;
                screen.getByTestId("pct").value = validBill.pct;
                screen.getByTestId("commentary").value = validBill.commentary;

                const form = screen.getByTestId("form-new-bill");

                userEvent.click(screen.getByText("Envoyer"))

                //expect(handleSubmit).toHaveBeenCalled()

                expect(handleSubmit).toHaveBeenCalledWith({
                    validBill
                })
            })
        })

        // #3 composant container/NewBill POST new bill
        describe("When I submit the bill's form", () => {
            test("POST bill from mock API with success", async() => {
                const postBill = jest.spyOn(firebase, "post")
                const validBill = {
                    type: "Equipement et matériel",
                    name: "Clavier-test",
                    date: "2021-10-20",
                    amount: 10,
                    vat: 10,
                    pct: 10,
                    commentary: "Test",
                    fileUrl: "https://en.wikipedia.org/wiki/File:Chrome-crash.png",
                    fileName: "logo.png",
                    email: "azerty@email.com",
                    status: "pending"
                };
                const bills = await firebase.post(validBill);
                expect(postBill).toBeCalled();
                expect(bills.data.length).toBe(5);
            })
        })
    })
})