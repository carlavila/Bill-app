/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      //to-do write expect expression

    })
    /* Test tri dates ordre décroissant  */
    test("Then bills should be ordered from earliest to latest", () => {     
      // const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i)
      // .map((a) => a.innerHTML);
      //  const antiChrono = (a, b) => (a.date < b.date ? -1 : 1)
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      /*  à l'écran, affichage dates par le format : 1 à 2 chiffres pour le jour,
      Une lettre majuscule + 2 lettres minuscule + un point  pour le mois
      2 chiffres pour l'année  */
      const dates = screen.getAllByText(/(\d{1,2}\s[A-Za-zÀ-ÖØ-öø-ÿ]{3}\.\s\d{2})/i)
      .map((a) => a.innerHTML)
     /* utilisation de l'objet new Date sinon trie alphanumérique à cause du format du mois   */
      const antiChrono = (a, b) => (new Date(a.date) < new Date(b.date) ? -1 : 1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)       
    })
  })
})
