import { getByTestId, getByText, screen } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import userEvent from "@testing-library/user-event";
import { localStorageMock } from "../__mocks__/localStorage";
import firebase from "../__mocks__/firebase.js";
import Router from "../app/Router";
import { ROUTES } from "../constants/routes"

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
                document.body.innerHTML = NewBillUI();
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })

                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                }))

                const file = new File(['(⌐□_□)'], 'test.jpg', { type: 'image/jpg' })

                fireEvent.change(screen.getByTestId("file"), {
                    target: {
                        files: [file],
                    },
                })

                const input = screen.getByTestId("file")
                expect(input.files[0]).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
                expect(input.files[0].name).toBe('test.jpg');
                expect(input.classList.contains('is-invalid')).toBe(false)
            })
        })
        describe("When I upload something other than an image in file input", () => {
            test("Then one file should be uploaded with an error", () => {
                document.body.innerHTML = NewBillUI();
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })

                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                }))

                const file = new File(['document.pdf'], 'document.pdf', { type: 'application/pdf' });

                fireEvent.change(screen.getByTestId("file"), {
                    target: {
                        files: [file],
                    },
                })

                const input = screen.getByTestId("file")
                expect(input.files[0]).toStrictEqual(file)
                expect(input.files).toHaveLength(1)
                expect(input.files[0].name).toBe('document.pdf');
                expect(input.classList.contains('is-invalid')).toBe(true)
            })
        })
        describe("When I submit the form completed", () => {
            test("Then the bill is created", async() => {

                document.body.innerHTML = NewBillUI();
                Object.defineProperty(window, 'localStorage', { value: localStorageMock })

                Object.defineProperty(window, 'localStorage', { value: localStorageMock })
                window.localStorage.setItem('user', JSON.stringify({
                    type: 'Employee',
                    email: "azerty@email.com",
                }))

                const onNavigate = (pathname) => {
                    document.body.innerHTML = ROUTES({ pathname })
                }
                const newBill = new NewBill({
                    document,
                    onNavigate,
                    firestore: null,
                    localStorage: window.localStorage
                })

                const validBill = {
                    type: "Equipement et matériel",
                    name: "Clavier-test",
                    date: "2021-10-20",
                    amount: 10,
                    vat: 10,
                    pct: 10,
                    commentary: "Test",
                    fileUrl: "../img/0.jpg",
                    fileName: "test.jpg",
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

                newBill.fileName = validBill.fileName
                newBill.fileUrl = validBill.fileUrl;

                newBill.createBill = jest.fn();
                const handleSubmit = jest.fn(newBill.handleSubmit);

                const form = screen.getByTestId("form-new-bill");
                form.addEventListener("submit", handleSubmit);

                userEvent.click(screen.getByText("Envoyer"))

                expect(handleSubmit).toHaveBeenCalled()
                expect(newBill.createBill).toHaveBeenCalledWith({
                    ...validBill
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