
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, afterEach } from 'vitest'
import { userEvent } from '@testing-library/user-event';

import EmployeeForm from './EmployeeForm';

afterEach(() => {
    vi.resetAllMocks();
})

describe("Form renders correctly", () => {
    it("Renders Name Text Box", () => {
        render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={vi.fn()}/>);
        
        const nameBox = screen.getByTestId(/name-input-element/i);
        expect(nameBox).toBeInTheDocument();
        expect(nameBox).toHaveValue("");
    })
    it("Renders Value Text Box", () => {
        render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={vi.fn()}/>);
        
        const valueBox = screen.getByTestId(/value-input-element/i);
        expect(valueBox).toBeInTheDocument()
        expect(valueBox).toHaveValue(0);
    })
    it("Renders Submit Button", () => {
        render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={vi.fn()}/>);
        
        const submitButton = screen.getByText(/Submit/i);
        expect(submitButton).toBeInTheDocument();
    })
})
describe("Form accepts inputs", () => {
    it("Allows Name text input, backspace", async () => {
        const user = userEvent.setup();
        render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={vi.fn()}/>);

        const nameBox = screen.getByTestId(/name-input-element/i);
        await nameBox.focus();
        expect(nameBox).toHaveFocus();

        await user.keyboard("Test Name");
        expect(nameBox).toHaveValue("Test Name");

        await user.keyboard("{Backspace}");
        expect(nameBox).toHaveValue("Test Nam");
    })
    it("Prevents Name text input past 50 characters", async () => {
        const user = userEvent.setup();
        render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={vi.fn()}/>);

        const nameBox = screen.getByTestId(/name-input-element/i);
        await nameBox.focus();
        expect(nameBox).toHaveFocus();

        await user.keyboard("Test Name{a>50/}");
        expect(nameBox).toHaveValue("Test Nameaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");//cuts the value short at 50 characters if it goes over
    })
    it("Allows Value numerical input, disallows non-numeric input", async () => {
        const user = userEvent.setup();
        render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={vi.fn()}/>);

        const valueBox = screen.getByTestId(/value-input-element/i);
        await valueBox.focus();
        expect(valueBox).toHaveFocus();

        await user.keyboard("1234");
        expect(valueBox).toHaveValue(12340);//there's an initial value of 0

        await user.keyboard("sddas22");
        expect(valueBox).toHaveValue(1234220);//filters values outside of numerals
    })
})
describe("Form takes on input values", () => {
    it("Receives and displays name correctly, allows editing", async () => {
        const user = userEvent.setup();
        render(<EmployeeForm employee={{name:"Harold", value:0}} submitEmployeeData={vi.fn()}/>);

        const nameBox = screen.getByTestId(/name-input-element/i);
        expect(nameBox).toHaveValue("Harold");

        await nameBox.focus();
        expect(nameBox).toHaveFocus();

        await user.keyboard("{Backspace>6/}");
        expect(nameBox).toHaveValue("");

        await user.keyboard("Test Name");
        expect(nameBox).toHaveValue("Test Name");
    })
    it("Receives and displays value correctly, allows editing", async () => {
        const user = userEvent.setup();
        render(<EmployeeForm employee={{name:"Harold", value:666}} submitEmployeeData={vi.fn()}/>);

        const valueBox = screen.getByTestId(/value-input-element/i);
        expect(valueBox).toHaveValue(666);

        await valueBox.focus();
        expect(valueBox).toHaveFocus();

        //for some reason focus puts the cursor on the left (so backspace doesn't work but delete does) on a number input and right on a text input. Odd, but can be worked around.
        await user.keyboard("{Delete>2/}");
        expect(valueBox).toHaveValue(6);

        await user.keyboard("12345");
        expect(valueBox).toHaveValue(123456);
    })
})
describe("Form submits correctly", () => {
    it("Submits correct values when submit button is clicked", async () => {
        const submitCall_Mock = vi.fn();

        const user = userEvent.setup();
        render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={submitCall_Mock}/>);

        const nameBox = screen.getByTestId(/name-input-element/i);
        await nameBox.focus();
        expect(nameBox).toHaveFocus();

        await user.keyboard("Test Name");
        expect(nameBox).toHaveValue("Test Name");

        const valueBox = screen.getByTestId(/value-input-element/i);
        await valueBox.focus();
        expect(valueBox).toHaveFocus();

        await user.keyboard("1234");
        expect(valueBox).toHaveValue(12340);

        const submitButton = screen.getByText(/Submit/i);
        await user.click(submitButton);

        expect(submitCall_Mock).toHaveBeenCalledOnce();

        expect(submitCall_Mock).toHaveBeenCalledWith({name:"Test Name", value:"12340"})
    })
    describe("Doesn't submit when incorrect values are input:", () => {
        it("Name = ''", async () => {
            const submitCall_Mock = vi.fn();
    
            const user = userEvent.setup();
            render(<EmployeeForm employee={{name:"", value:0}} submitEmployeeData={submitCall_Mock}/>);
    
            const valueBox = screen.getByTestId(/value-input-element/i);
            await valueBox.focus();
            expect(valueBox).toHaveFocus();
    
            await user.keyboard("1234");
            expect(valueBox).toHaveValue(12340);
    
            const submitButton = screen.getByText(/Submit/i);
            await user.click(submitButton);//name = "" so won't be permitted
    
            expect(submitCall_Mock).not.toHaveBeenCalled();
        })
        it("Name = '                '", async () => {
            const submitCall_Mock = vi.fn();
    
            const user = userEvent.setup();
            render(<EmployeeForm employee={{name:"                ", value:0}} submitEmployeeData={submitCall_Mock}/>);
        
            const submitButton = screen.getByText(/Submit/i);
            await user.click(submitButton);//name = "" so won't be permitted
    
            expect(submitCall_Mock).not.toHaveBeenCalled();
        })
        it("Number = ''", async () => {
            const submitCall_Mock = vi.fn();
    
            const user = userEvent.setup();
            render(<EmployeeForm employee={{name:"Test Name", value:0}} submitEmployeeData={submitCall_Mock}/>);
    
            const valueBox = screen.getByTestId(/value-input-element/i);
            await valueBox.focus();
            expect(valueBox).toHaveFocus();
    
            await user.keyboard("{Delete}");
            expect(valueBox).toHaveValue(null);
    
            const submitButton = screen.getByText(/Submit/i);
            await user.click(submitButton);//value = "" so won't be permitted
    
            expect(submitCall_Mock).not.toHaveBeenCalled();
        })
        it("Number > 2^31", async () => {
            const submitCall_Mock = vi.fn();
    
            const user = userEvent.setup();
            render(<EmployeeForm employee={{name:"Test Name", value:0}} submitEmployeeData={submitCall_Mock}/>);
    
            const valueBox = screen.getByTestId(/value-input-element/i);
            await valueBox.focus();
            expect(valueBox).toHaveFocus();
    
            await user.keyboard("1234000000000000000");
            expect(valueBox).toHaveValue(12340000000000000000);
    
            const submitButton = screen.getByText(/Submit/i);
            await user.click(submitButton);//value > 2^31 so won't be permitted
    
            expect(submitCall_Mock).not.toHaveBeenCalled();
        })
        it("Number < 0", async () => {
            const submitCall_Mock = vi.fn();
    
            const user = userEvent.setup();
            render(<EmployeeForm employee={{name:"Test Name", value:0}} submitEmployeeData={submitCall_Mock}/>);
    
            const valueBox = screen.getByTestId(/value-input-element/i);
            await valueBox.focus();
            expect(valueBox).toHaveFocus();
    
            await user.keyboard("-1");
            expect(valueBox).toHaveValue(-10);
    
            const submitButton = screen.getByText(/Submit/i);
            await user.click(submitButton);//value < 0 so won't be permitted
    
            expect(submitCall_Mock).not.toHaveBeenCalled();
        })
    })
})