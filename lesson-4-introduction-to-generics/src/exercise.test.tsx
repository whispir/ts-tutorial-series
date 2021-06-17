import { callTheFunctionForMe, createFruitFromColor, returnFavouriteColor, returnPayloadOfValue, returnsSameTypeAsValueParameter, someFunction } from "./exercise";

describe("returnsSameTypeAsValue", () => {
    it("does not have an error if the types are the same", () => {


        const result: number = returnsSameTypeAsValueParameter(9);

        const result2: { obj: string } = returnsSameTypeAsValueParameter({ obj: "hello" });

    });

    it("does have an error if the types are not the same", () => {
        //@ts-expect-error
        const result: number = returnsSameTypeAsValueParameter("aaa");

        //@ts-expect-error
        const result2: { obj: string } = returnsSameTypeAsValueParameter({ foo: "hello" });

    });
})


describe("returnPayloadOfValue", () => {
    it("does not have errors if the typing is the same", () => {


        const result = returnPayloadOfValue("hello");
        const value: string = result.value;
        const weight: number = result.weight;


        const result2 = returnPayloadOfValue({ fn: () => 9 });
        const value2: { fn: () => number } = result2.value;
        const weight2: number = result2.weight;

    });


    it("does not have errors if the typing is the same", () => {


        const result = returnPayloadOfValue(999);
        //@ts-expect-error
        const value: string = result.value;
        const weight: number = result.weight;


        const result2 = returnPayloadOfValue({ fn: () => "hello" });

        //@ts-expect-error
        const value2: { fn: () => number } = result2.value;
        //@ts-expect-error
        const weight2: string = result2.weight;

    });
});

describe("returnFavouriteColor", () => {
    it("has type errors if you don't pass a correct color in", () => {
        //@ts-expect-error
        returnFavouriteColor("orange");
    })


    it("has the return type matches the color passed in", () => {
        const color: "red" = returnFavouriteColor("red");

        //@ts-expect-error
        const color2: "blue" = returnFavouriteColor("red");
    })
});



describe("createFruitFromColor", () => {

    it("has type errors if you pass the wrong color in", () => {
        //@ts-expect-error
        createFruitFromColor("orange");
    })


    it("the return type matches the color passed in", () => {
        const result = createFruitFromColor("red");

        const color: "red" = result.color;

        //@ts-expect-error
        const color2: "blue" = result.color;
    })

});

describe("someFunction", () => {


    it("c has alpha, bravo, and charlie properties", () => {
        //@ts-expect-error
        someFunction("1", "2", {

        });


        someFunction("1", "2", {
            alpha: "one",
            bravo: "two",
            charlie: 3
        });
    });

    it("a and c.alpha are the same type", () => {


        someFunction("1", "2", {
            //@ts-expect-error
            alpha: 123,
            bravo: "two",
            charlie: 3
        });
    });

    it("b and c.bravo are the same type", () => {


        someFunction("1", "2", {
            alpha: "123",
            //@ts-expect-error
            bravo: 2,
            charlie: 3
        });
    });

    it("c has a generically typed charlie property", () => {

        const result = someFunction("1", "2", {
            alpha: "123",
            bravo: "222",
            charlie: 3
        });


        const c: number = result.charlie;

        //@ts-expect-error
        const d: string = result.charlie;

    });

});


describe("callTheFunctionForMe", () => {

    it("works if everything matches", () => {
        const result: string = callTheFunctionForMe((value: string) => "hello", "foo");

        const result2: string = callTheFunctionForMe((value: {name: string}) => "hello", {name: 'hello'});

    });

    it("the return matches the callback return type", () => {
        //@ts-expect-error
        const result: number = callTheFunctionForMe((value: string) => "hello", "foo");
    });

    it("The parameter matches the callback parameter", () => {
        //@ts-expect-error
        const result: string = callTheFunctionForMe((value: string) => "hello", 989);

        //@ts-expect-error
        const result2: string = callTheFunctionForMe((value: {name: string}) => "hello", 989);
    });
});