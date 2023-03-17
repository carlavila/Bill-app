/**
 * @jest-environment jsdom
 */
 import "@testing-library/jest-dom/extend-expect";
 import { screen, fireEvent } from "@testing-library/dom";
 import NewBillUI from "../views/NewBillUI.js";
 import NewBill from "../containers/NewBill.js";
 import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
 import { localStorageMock } from "../__mocks__/localStorage.js";
 import mockStore from "../__mocks__/store";
 import router from "../app/Router.js";
 
 // //AL added mock
 jest.mock("../app/store", () => mockStore);
 window.alert = jest.fn();
 
 describe("Given I am connected as an employee", () => {
   describe("When I am on NewBill Page", () => {
     test("The page should contain 'Envoyer une note de frais'", () => {
       const html = NewBillUI();
       document.body.innerHTML = html;
       //to-do write assertion
       expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
     });
   });
 
   describe("When I add an non-image file as bill proof", () => {
     test("Then throw an alert", () => {
       window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname });
       };
 
       const html = NewBillUI();
       document.body.innerHTML = html;
       const newBills = new NewBill({
         document,
         onNavigate,
         localStorage: window.localStorage,
       });
 
       const handleChangeFile = jest.fn((e) => newBills.handleChangeFile);
       const fileInput = screen.getByTestId("file");
 
       fileInput.addEventListener("change", handleChangeFile);
       fireEvent.change(fileInput, {
         target: {
           files: [new File(["video.mp4"], "video.mp4", { type: "video/mp4" })],
         },
       });
       expect(handleChangeFile).toHaveBeenCalled();
       expect(window.alert).toHaveBeenCalled();
     });
   });
 
   describe("When I click on the button 'choisir un fichier' and I upload a file in the correct format", () => {
     test("it should add the file to the form", () => {
       window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
       const onNavigate = (pathname) => {
         document.body.innerHTML = ROUTES({ pathname });
       };
 
       const html = NewBillUI();
       document.body.innerHTML = html;
       const newBills = new NewBill({
         document,
         onNavigate,
         localStorage: window.localStorage,
       });
 
       const handleChangeFile = jest.fn((e) => newBills.handleChangeFile);
       const fileInput = screen.getByTestId("file");
 
       fileInput.addEventListener("change", handleChangeFile);
       fireEvent.change(fileInput, {
         target: {
           files: [new File(["proof.jpg"], "proof.jpg", { type: "proof/jpg" })],
         },
       });
 
       expect(handleChangeFile).toHaveBeenCalled();
       expect(fileInput.files[0].name).toBe("proof.jpg");
     });
   });
 });
 
 describe("When I add an image file as bill proof", () => {
   test("Then this new file should change in the input", () => {
     window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
     const onNavigate = (pathname) => {
       document.body.innerHTML = ROUTES({ pathname });
     };
 
     const html = NewBillUI();
     document.body.innerHTML = html;
     const newBills = new NewBill({
       document,
       onNavigate,
       localStorage: window.localStorage,
     });
 
     const handleChangeFile = jest.fn((e) => newBills.handleChangeFile);
     const fileInput = screen.getByTestId("file");
 
     fileInput.addEventListener("change", handleChangeFile);
     fireEvent.change(fileInput, {
       target: {
         files: [new File(["proof.jpg"], "proof.jpg", { type: "proof/jpg" })],
       },
     });
 
     expect(handleChangeFile).toHaveBeenCalled();
     expect(fileInput.files[0].name).toBe("proof.jpg");
   });
 });
 
 describe("Given I am a user connected as Employee", () => {
   describe("When I navigate to Bill page", () => {
     test("fetches New Bills from mock API", async () => {
       beforeEach(() => {
         jest.spyOn(mockStore, "bills");
         Object.defineProperty(window, "localStorage", {
           value: localStorageMock,
         });
         window.localStorage.setItem(
           "user",
           JSON.stringify({
             type: "Employee",
             email: "a@a",
           })
         );
       });
     });
     describe("When an error occurs on API", () => {
       beforeEach(() => {
         jest.spyOn(mockStore, "bills");
         Object.defineProperty(window, "localStorage", {
           value: localStorageMock,
         });
         window.localStorage.setItem(
           "user",
           JSON.stringify({
             type: "Employee",
             email: "a@a",
           })
         );
         const root = document.createElement("div");
         root.setAttribute("id", "root");
         document.body.appendChild(root);
         router();
       });
       test("fetches bills from an API and fails with 404 message error", async () => {
         mockStore.bills.mockImplementationOnce(() => {
           return {
             list: () => {
               return Promise.reject(new Error("Erreur 404"));
             },
           };
         });
         window.onNavigate(ROUTES_PATH["Bills"]);
         await new Promise(process.nextTick);
         const message = await screen.getByText(/Erreur 404/);
         expect(message).toBeTruthy();
       });
 
       test("fetches messages from an API and fails with 500 message error", async () => {
         mockStore.bills.mockImplementationOnce(() => {
           return {
             list: () => {
               return Promise.reject(new Error("Erreur 500"));
             },
           };
         });
 
         window.onNavigate(ROUTES_PATH["Bills"]);
         await new Promise(process.nextTick);
         const message = await screen.getByText(/Erreur 500/);
         expect(message).toBeTruthy();
       });
     });
   });
 });
 
 describe("when I click on the submit button", () => {
   test("the bill should be sent", () => {
     jest.spyOn(mockStore, "bills");
     Object.defineProperty(window, "localStorage", { value: localStorageMock });
     window.localStorage.setItem(
       "user",
       JSON.stringify({
         type: "Employee",
         email: "a@a",
       })
     );
 
     const expenseType = screen.getByTestId("expense-type");
     expenseType.value = "Transports";
 
     const expenseName = screen.getByTestId("expense-name");
     expenseName.value = "test1";
 
     const expenseAmount = screen.getByTestId("amount");
     expenseAmount.value = 100;
 
     const expenseDate = screen.getByTestId("datepicker");
     expenseDate.value = "2001-01-01";
 
     const expenseVAT = screen.getByTestId("vat");
     expenseVAT.value = "";
 
     const expensePCT = screen.getByTestId("pct");
     expensePCT.value = 20;
 
     const expenseCommentary = screen.getByTestId("commentary");
     expenseCommentary.value = "plop";
 
     const form = screen.getByTestId("form-new-bill");
     fireEvent.submit(form);
 
     expect(form).toBeTruthy();
   });
 });
 
 describe("I am connected as an employee and on Bill page", () => {
   test("fetches new Bills from mock API POST", async () => {
     const newBill = {
       id: "47qAXb6fIm2zOKkLzMro",
       vat: "80",
       fileUrl:
         "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
       status: "pending",
       type: "Hôtel et logement",
       commentary: "séminaire billed",
       name: "encore",
       fileName: "preview-facture-free-201801-pdf-1.jpg",
       date: "2004-04-04",
       amount: 400,
       commentAdmin: "ok",
       email: "a@a",
       pct: 20,
     };
 
     const getSpy = jest.spyOn(mockStore, "post"); //"mockstore" à la place de "store"?
 
     await mockStore.post(newBill);
     expect(getSpy).toHaveBeenCalledTimes(1);
     expect(getSpy).toHaveBeenLastCalledWith(newBill);
   });
 });