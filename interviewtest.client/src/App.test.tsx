import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest'
import { userEvent } from '@testing-library/user-event';

import App from "./App.tsx"


const fetchMock = vi.fn((urlString, otherArgs) => {
    if(urlString === 'api/employees' && !otherArgs?.method || otherArgs?.method === "GET")
        return Promise.resolve({
            json: () => Promise.resolve( [{name:"Test Name", value:100}] ),
        })
    if(urlString === 'api/employees/mathstuff' && (!otherArgs?.method || otherArgs?.method === "GET"))
        return Promise.resolve({
            json: () => Promise.resolve( 100 ),
        })
    if(urlString.includes('api/employees/') && (otherArgs?.method === "DELETE"))
        return Promise.resolve({
            status: 204
        })
    if(urlString.includes('api/employees') && (otherArgs?.method === "POST"))
        return Promise.resolve({
            json: () => Promise.resolve( JSON.parse(otherArgs.body) ),
        })
    if(urlString.includes('api/employees') && (otherArgs?.method === "PUT"))
        return Promise.resolve({
            status: 204
        })
    if(urlString.includes('api/employees') && (otherArgs?.method === "PATCH"))
        return Promise.resolve({
            status: 204
        })
});

vi.stubGlobal('fetch', fetchMock);

afterEach(() => {
    vi.resetAllMocks();
})

it("Calls fetch as expected on initial render", async () => {
    await render(<App />)

    await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(2);
    })
})

describe("Basic components rendered correctly", () => {
    describe("Renders connectivity test data", () => {
        it("Renders 'Not Ready' when connection hasn't been established", async () => {
            fetchMock.mockResolvedValueOnce({
                json: () => Promise.resolve( [] ),
            })

            render(<App/>)

            await waitFor(() => {
                const connectivityText = screen.getByText(/Not Ready/i);
                expect(connectivityText).toBeInTheDocument();
            });
        })
        it("Renders 'OK' when connection has been established", async () => {
            render(<App/>)

            await waitFor(() => {
                const connectivityText = screen.queryByText(/OK/i);
                expect(connectivityText).not.toBeInTheDocument();
            });
        })
    })
    it("Renders value increment button", async () => {
        render(<App/>)

        await waitFor(() => {//don't really need the await here, but otherwise the test client tells me off for changing state, so...
            const incrementorButton = screen.getByText(/Increment Value/i)
            expect(incrementorButton).toBeInTheDocument();
        })
    })
    it("Does NOT render maths test value when below 11171", async () => {
        render(<App/>)

        await waitFor(() => {//don't really need the await here, but otherwise the test client tells me off for changing state, so...
            const valuesText = screen.queryByText(/A, B and C/i)
            expect(valuesText).not.toBeInTheDocument();
        })
    })
    it("Does render maths test value when above 11171", async () => {

        fetchMock.mockImplementation((urlString) => {
            if(urlString === 'api/employees')
                return Promise.resolve({
                    json: () => Promise.resolve( [{name:"Test Name", value:100}] ),
                })
            if(urlString === 'api/employees/mathstuff')
                return Promise.resolve({
                    json: () => Promise.resolve( 10000000 ),
                })
        })

        render(<App/>)

        await waitFor(() => {//don't really need the await here, but otherwise the test client tells me off for changing state, so...
            const valuesText = screen.queryByText(/A, B and C/i)
            expect(valuesText).toBeInTheDocument();
        })
    })
    it("Does render maths test value when equal to 11171", async () => {

        fetchMock.mockImplementation((urlString) => {
            if(urlString === 'api/employees')
                return Promise.resolve({
                    json: () => Promise.resolve( [{name:"Test Name", value:100}] ),
                })
            if(urlString === 'api/employees/mathstuff')
                return Promise.resolve({
                    json: () => Promise.resolve( 11171 ),
                })
        })

        render(<App/>)

        await waitFor(() => {//don't really need the await here, but otherwise the test client tells me off for changing state, so...
            const valuesText = screen.queryByText(/A, B and C/i)
            expect(valuesText).toBeInTheDocument();
        })
    })
})
describe("API editing calls made correctly", () => {
    it("Calls Delete:fetch(DELETE) correctly", async () => {
        const user = userEvent.setup();

        render(<App/>)

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(2);
        })

        const deleteElement = screen.getByText(/Delete/i);
        await user.click(deleteElement)

        expect(fetchMock).toHaveBeenCalledTimes(5);//2 initially on load, one to send the delete, two subsequently once the change is registered
        expect(fetchMock).toHaveBeenNthCalledWith(3, 'api/employees/Test Name', {method:"DELETE"});

    })
    it("Calls Submit:fetch(POST) correctly", async () => {
        const user = userEvent.setup();

        render(<App/>)

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(2);
        })
        
        const nameBox = screen.getByTestId(/name-input-element/i);
        await nameBox.focus();
        expect(nameBox).toHaveFocus();

        await user.keyboard("Test Name222");
        expect(nameBox).toHaveValue("Test Name222");

        const submitElement = screen.getByText(/Submit/i);
        await user.click(submitElement)

        expect(fetchMock).toHaveBeenNthCalledWith(3, 'api/employees', {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:"Test Name222", value:0})});

        expect(fetchMock).toHaveBeenCalledTimes(5);
    })
    it("Calls Submit:fetch(PUT) correctly", async () => {
        const user = userEvent.setup();

        render(<App/>)

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(2);
        })

        const editElement = screen.getByText(/Edit/i);
        await user.click(editElement)
        
        const nameBoxes = screen.getAllByTestId(/name-input-element/i);
        expect(nameBoxes).toHaveLength(2);
        await nameBoxes[1].focus();

        await user.keyboard("222");
        expect(nameBoxes[1]).toHaveValue("Test Name222");

        const submitElement = screen.getAllByText(/Submit/i)[1];
        await user.click(submitElement)

        expect(fetchMock).toHaveBeenNthCalledWith(3, 'api/employees/Test Name', {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name:"Test Name222", value:100})});

        expect(fetchMock).toHaveBeenCalledTimes(5);
    })
    it("Calls Increment Value:fetch(PATCH) correctly", async () => {
        const user = userEvent.setup();

        render(<App/>)

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(2);
        })

        const incrementElement = screen.getByText(/Increment/i);
        await user.click(incrementElement)

        expect(fetchMock).toHaveBeenNthCalledWith(3, 'api/employees', {method:"PATCH"});

        expect(fetchMock).toHaveBeenCalledTimes(5);
    })
})