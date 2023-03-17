/**
 * @jest-environment jsdom
 */

 import '@testing-library/jest-dom'
 import {screen, waitFor, getByTestId, getAllByTestId} from '@testing-library/dom'
 import BillsUI from '../views/BillsUI.js'
 import { bills } from '../fixtures/bills.js'
 import Bills from '../containers/Bills.js'
 import { ROUTES, ROUTES_PATH} from '../constants/routes.js'
 import {localStorageMock} from '../__mocks__/localStorage.js'
 import router from '../app/Router.js'
 import mockedBills from '../__mocks__/store.js'
 
 const onNavigate = (pathname) => {
   document.body.innerHTML = ROUTES({ pathname, data: bills })
 }
 
 describe('Given I am connected as an employee', () => {

   describe('When I am on Bills Page', () => {		
     test('Then bills should be ordered from earliest to latest', () => {
       document.body.innerHTML = BillsUI({ data: bills })
       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       const antiChrono = (a, b) => ((a < b) ? 1 : -1)
       const datesSorted = dates.sort(antiChrono)
       expect(dates).toEqual(datesSorted)
     })
     test('Then bill icon in vertical layout should be highlighted', async () => {		
       Object.defineProperty(window, 'localStorage', { value: localStorageMock })//simule le localstorage
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
       const root = document.createElement('div')
       root.setAttribute('id', 'root')
       document.body.append(root)
       router()
       window.onNavigate(ROUTES_PATH.Bills)
       const windowIcon = getAllByTestId(document.body, 'icon-window')[0]
       await waitFor(() => windowIcon)
       expect(windowIcon).toHaveClass('active-icon')
     })

     test('Then the newBill btn should be present',  async () => {
       document.body.innerHTML = BillsUI({ data: bills })
       const addNewBillBtn = getByTestId(document.body, 'btn-new-bill')
       await waitFor(() => addNewBillBtn)
       expect(addNewBillBtn).toBeInTheDocument()
     })

     test('Then, Loading page should be rendered', () => {
       document.body.innerHTML = BillsUI({ loading: true })
       expect(screen.getAllByText('Loading...')).toBeTruthy()
     })

     test('Then, Error page should be rendered', () => {
       document.body.innerHTML = BillsUI({ error: 'oops an error' })
       expect(screen.getAllByText('Erreur')).toBeTruthy()
     })
     
     describe('When I want to add a new Bill', () => {
       test('Then the click new bill handler should be called',  () => {
         document.body.innerHTML = BillsUI({ data: bills })
         const sampleBills = new Bills({ document, onNavigate, store: null, localStorage: window.localStorage })
         sampleBills.handleClickNewBill = jest.fn()
         screen.getByTestId('btn-new-bill').addEventListener('click', sampleBills.handleClickNewBill)
         screen.getByTestId('btn-new-bill').click()
         expect(sampleBills.handleClickNewBill).toBeCalled()
       })
     })
     describe('And I click on the eye icon', () => {
       test('A modal should open', () => {
         document.body.innerHTML = BillsUI({ data: bills })
         const sampleBills = new Bills({ document, onNavigate, firestore: null, localStorage: window.localStorage })
         sampleBills.handleClickIconEye = jest.fn()
         screen.getAllByTestId('icon-eye')[0].click()
         expect(sampleBills.handleClickIconEye).toBeCalled()
       })
       test('Then the modal should display the attached image', () => {
         document.body.innerHTML = BillsUI({ data: bills })
         const sampleBills = new Bills({ document, onNavigate, firestore: null, localStorage: window.localStorage })
         const iconEye = document.querySelector('div[data-testid="icon-eye"]')
         $.fn.modal = jest.fn()
         sampleBills.handleClickIconEye(iconEye)
         expect($.fn.modal).toBeCalled()
         expect(document.querySelector('.modal')).toBeTruthy()
       })
     })
     describe('test d\'intégration GET', () => {
       test('fetches bills from mock API GET', async () => {
         const getSpy = jest.spyOn(mockedBills, 'bills')
         const bills = await mockedBills.bills().list()
         expect(getSpy).toHaveBeenCalledTimes(1)
         expect(bills.length).toBe(4)
       })
       describe('When an error occurs on API', () => {
         test('fetches bills from an API and fails with 404 message error', () => {
           mockedBills.bills.mockImplementationOnce(() => {
             return {
               list : () =>  {
                 return Promise.reject(new Error('Erreur 404'))
               }
             }})
           const html = BillsUI({ error: 'Erreur 404' })
           document.body.innerHTML = html
           const message = screen.getByText(/Erreur 404/)
           expect(message).toBeTruthy()
         })
   
         test('fetches messages from an API and fails with 500 message error', async () => {
           mockedBills.bills.mockImplementationOnce(() => {
             return {
               list : () =>  {
                 return Promise.reject(new Error('Erreur 500'))
               }
             }})
           const html = BillsUI({ error: 'Erreur 500' })
           document.body.innerHTML = html
           const message = screen.getByText(/Erreur 500/)
           expect(message).toBeTruthy()
         })
       })
     })
   })
 
 
 
 })