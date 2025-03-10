# Tricky Bits and Useful Bits

A lot of what we are going to be talking about in this lesson will be reiterating stuff that we've covered in previous lessons. 

## TypeScript Utility Types 

https://www.typescriptlang.org/docs/handbook/utility-types.html

The TypeScript utility types are your friend, get used to looking them up to see if the can do something you need. 


## JavaScript mutability 

First, lets talk about variable reassignment and object mutability in plain ol' JavaScript. 

The `const` keyword prevents variable _reassignment_. Most linters and TypeScript will pick this up in your IDE and give you a warning about it. 

```javascript
/**
 * VARIABLE REASSIGNMENT
 */

const foo = {
    name: 'bob'
}; 

console.log(foo); 

try {
    // This will give a runtime error!
// Object _reassignment_ is not allowed with the const keyword. 
    foo = {
        name: 'alice'
    }; 
}catch(err) {
    console.log(err);
}
    
```

However, remember that the `const` keyword only prevents reassigning the variable itself, it doesn't prevent _mutating_ any object there.

```javascript

/**
 * OBJECT MUTATION
 */

// But object _mutation_ is A-OK.
foo.name = 'alice'; 
console.log(foo);
```


Object mutation can be prevent with `Object.freeze`

```javascript

/**
 * OBJECT.FREEZE
 */

//of course, you can use Object.freeze to prevent mutation. 

const foo2 = Object.freeze(foo); 
console.log(foo2);

// This won't give a runtime error, but the object won't be mutated. 
foo2.name = 'chaz'; 

console.log(foo2);
```


But Object.freeze is shallow 

```javascript 
// But object.freeze is shallow
const bar = {
    name: "foo", 
    obj: {
        value: 1
    }
}

const frozenBar = Object.freeze(bar); 
console.log(frozenBar); 

frozenBar.obj.value = 10; 
console.log(frozenBar);
```

## Readonly type. 

TypeScript has this concept of Readonly types, which reflects the native JavaScript immutability features.

Note though, that when we compile this TypeScript isn't injecting 'Object.freeze' functionality into this code, at runtime these objects are mutable!

```typescript 
type Bar = Readonly<{
    name: string; 
    obj: {
        value: number; 
    }
}>; 

const bar : Bar = {
    name: "bob", 
    obj: {
        value: 999
    }
}; 

bar.name ="aaa"; //Cannot assign to 'name' because it is a read-only property.ts(2540)
bar.obj.value = 9999; 

```

Compiled javascript: 

```javascript
"use strict";
const bar = {
    name: "bob",
    obj: {
        value: 999
    }
};
bar.name = "aaa"; //Cannot assign to 'name' because it is a read-only property.ts(2540)
bar.obj.value = 9999;

```

If you use the Object.freeze functionality then its output is a Readonly type. 

Note that like Object.freeze, the Readonly type is also shallow. 

```typescript 
const foo = {
    a: {
        b: "hello"
    }
}; 
// const foo: {
//     a: {
//         b: string;
//     };
// }

const foo2 = Object.freeze(foo);
// const foo2: Readonly<{
//     a: {
//         b: string;
//     };
// }>

```


If you wanted a DeepReadonly, you could do this: 

```typescript
type DeepReadonly<T> = Readonly<{
  [key in keyof T] : DeepReadonly<T[key]>
}>
```

(But to be honest I would be looking at using something like Immutable.js or a linting rule to prevent property reassignment). 


## Type Widening of strings that are on objects

Let's say you have some code that looks like this: 

```typescript 
type SomeObject = {
    userType: "admin" | "user"; 
}


function usesAnObject(obj: SomeObject) {

}


usesAnObject({
    userType: "admin"
}); 
```


So far, so good. 

However, if we restructure the code slightly, like: 

```typescript
const theObject = {
    userType: "admin"
}; 

usesAnObject(theObject); //Argument of type '{ userType: string; }' is not assignable to parameter of type 'SomeObject'.
```

Then we get an error. 

The issue comes back to _type inference_ (See lesson 3 - TypeScript is clever). 

In the first case because are declaring the object where we are using it, TypeScript knows that the value of the `userType` property is always `"admin"` and so it satisifies the constraint. 

In the second case, because we could potentially mutate `theObject` like: 

```typescript
theObject.userType = "blah"
```

TypeScript infers the value type of `userType` as the wider `string`, not `"admin"`. This is known as _type widening_. 

There's a few ways we can get around this. 

### The `as const` keyword. 

What the `as const` keyword does, is tell TypeScript to [infer to the typings as the narrowest possible](https://stackoverflow.com/questions/66993264/what-does-the-as-const-mean-in-typescript-and-what-is-its-use-case), rather than keeping them as the wider `string` type for example. 

### Declare the string as const 

```typescript

const theObject2 = {
    userType: "admin" as const
}; 

usesAnObject(theObject2);
```

In this scenario we are telling TypeScript '`userType` property should be treated as its narrow inference `"admin"` not the wider inference `string`. 
### Declare the string as "admin" | "user"

```typescript 
const theObject3 = {
    userType: "admin" as "admin" | "user"
}; 

usesAnObject(theObject3);
```

In this scenario, we are telling TypeScript that '`userType` can be reassigned, but it can only ever be `"admin" | "user"`'. 

In that case, it would satisfy the constraints. 

### Declare the `theObject` as `SomeObject`

```typescript
const theObject4 = {
    userType: "admin"
} as SomeObject; 

usesAnObject(theObject4);

const theObject4b : SomeObject = {
    userType: "admin"
}; 

usesAnObject(theObject4b);
```

In this scenario we are telling TypeScript 'This object we are declaring, treat it as `SomeObject`', and TypeScript is then saying 'So that string I'm seeing here, it must be `"admin" | "user"`'. 

### Freeze `theObject` - Doesn't work

Surprisingly, this doesn't work. It appears that TypeScript is not smart enough to retain the narrowing typing. 

I raised an issue here: https://github.com/microsoft/TypeScript/issues/45341

```typescript
const theObject5 = Object.freeze({
    userType: "admin"
}); 

usesAnObject(theObject5);
```


### Declare `theObject` as const 

It was surprising to me, that this _does_ work. 

```typescript
const theObject6 = {
    userType: "admin"
} as const; 

usesAnObject(theObject6);
```

Note that this occurs on _deep_ level: 

```typescript
const theObject7 = {
    userType: "admin", 
    b: {
        userType: "admin"
    }
} as const; 

usesSomeObject2(theObject7); 
```
 
## Generic typing arrow functions

Generic typings on arrow functions can funky with React. 

Normal generic arrow function: 


```typescript
export const myArrowFunction = <T>(value: T) => {
    return value; 
}
```

No worries. 


React: 

```typescript
import React from 'react'; 

type ComponentProps<T> = {
    value: T; 
}

// A bunch of red squiggly lines!
const MyGenericComponent = <T>(value: ComponentProps<T>) => {
    return value; 
}; 
```

The issue is that the parser is getting confused by the angle brackets. 

The solution is to add a comma after the `T`. 

```typescript
const MyGenericComponent2 = <T,>(value: ComponentProps<T>) => {
    return value; 
}; 
```


## X is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of constraint Y.

I remember this being a super frustrating and arcane error message when I first encountered it, and as I'm writing this, I can't remember what it's about, but once you understand it, it makes sense. 

The purpose of this section is when you do inevitably encounter this error, just look it up to see what's happening and how to solve. 


Example of this error: 

```typescript
type SomeObject = {
    userType: "user" | "admin"
    name: string; 
}


export function makeAdmin<T extends SomeObject> (value: T) : T {

    // Type '{ userType: "admin"; name: string; }' is not assignable to type 'T'.
    // '{ userType: "admin"; name: string; }' is assignable to the constraint of type 'T', but 'T' could be instantiated with a different subtype of constraint 'SomeObject'.ts(2322)
    return {
        userType: "admin", 
        name: value.name
    }; 
}
```

This kind of error can initially be confusing, because we've said that T extends `SomeObject` and our return value is a valid `SomeObject`. 

What the error is telling you is that "Yes, it is a valid `SomeObject`, but there are other forms of `SomeObject` that this doesn't match". 

Basically in this scenario the issue is with our use of generic typings here, we are telling the function to return the same shape as the thing we passed in. What we really want to do is return a specifically 'admin' user type: 


```typescript
export function makeAdmin2<T extends SomeObject> (value: T) : {
    userType: "admin", 
    name: string; 
} {

  return {
        userType: "admin", 
        name: value.name
    }; 
}
```

(This is quite a simplified example of the problem, you tend to encounter this issue when dealing with highly abstracted HOCs etc). 

If you google for the problem, you'll find a lot of different examples on Stack Overflow of people asking the question, I think this is the best one: 

https://stackoverflow.com/questions/59148208/function-could-be-instantiated-with-a-different-subtype-of-constraint


## Object literals and excess property checking

**Object literal** - An object literal is when you create an object using the curly brackets syntax in JavaScript. 

```javascript
const foo = {}; // Object literal

const bar = new Date(); // Not an object literal 
```

 https://stackoverflow.com/questions/68718869/what-is-an-object-literal-in-typescript

**Excess property checking** 

Excess property checking means that TypeScript will give errors if an object literal contains additional properties than a type it is being assigned to. 

The rational for excess property checking is that any extra property was probably a mistake by the developer. 

See the example given in the [official documentation](https://www.typescriptlang.org/docs/handbook/interfaces.html#excess-property-checks): 

```typescript
interface SquareConfig {
  color?: string;
  width?: number;
}
 
function createSquare(config: SquareConfig): { color: string; area: number } {
  return {
    color: config.color || "red",
    area: config.width ? config.width * config.width : 20,
  };
}
 
let mySquare = createSquare({ colour: "red", width: 100 });
Argument of type '{ colour: string; width: number; }' is not assignable to parameter of type 'SquareConfig'.
  Object literal may only specify known properties, but 'colour' does not exist in type 'SquareConfig'. Did you mean to write 'color'?
```

In this scenario, `color` is optional, but the developer as made a typo with `colour`, which is an _excess property_ and TypeScript gives an error. 


_Excess property checking will only occur immediately at assignment_

```typescript
type Foo = {
    a: string; 
}

function usesFoo(value: Foo) {

}

function usesFoo2<T extends Foo> (value: T) {

}

const a : Foo = {
    a: "one", 
    b: 2, //  Object literal may only specify known properties, and 'b' does not exist in type 'Foo'.(2322)

}; 

const b = {
    a: "one", 
    b: 2, 
}; 


const c : Foo = {
    a: "one", 
    b: 2,
} as Foo; // Coercing will remove the excess type error 

usesFoo(b); // No error here!
usesFoo2(b); // No error here!

usesFoo({
    a: "one", 
    b: 2    //  Object literal may only specify known properties, and 'b' does not exist in type 'Foo'.(2345)
}); 

usesFoo2({
    a: "one", 
    b: 2    // No error here!
}); 
```

**nb.** It seems pretty reasonable to allow an object to contain excess properties, for example: 

```typescript
function greetPerson(person: {name: string}) {
    console.log("Hello", person.name); 
}
```

In this scenario the only properties a person object needs to have is `name` - but its imaginable that there's a lot more information on the object that is relevant elsewhere. 

_However_ do note that when using things like `Object.keys` or the spread operator, you might run into problems. 

```typescript 
type Bar = {
    a: string; 
};

type Chaz = {
    a: string, 
    c: "zip" | "zap"
}

function usesBar(value: Bar, c: "zip" | "zap") : Chaz {
    return {
        c, 
        ...value, // The excess properties will clobber the c value!
    }; 
}

const d = {
    a: "hello", 
    c: "blah blah blah"
}; 

const e = usesBar(d, "zip"); 

console.log(e);
// {
//  "c": "blah blah blah",
//  "a": "hello"
// }

```

There are no type errors in this code, but at run time the typings are no longer correct - the value of `e.c` is `blah blah blah`. 

This appears to be a limitation of TypeScript, and moral of the story is be careful when using spread operator (put the spread first?). 

This discussion also shows how to create a utility type to always check for excess properties: 

https://stackoverflow.com/questions/54775790/forcing-excess-property-checking-on-variable-passed-to-typescript-function

https://stackoverflow.com/questions/68358195/function-that-returns-a-type-behaves-differently-if-it-is-a-property-of-an-objec/68358441?noredirect=1#comment120812454_68358441


## Exercise

See `exercise.ts` - Fix the type errors. 


Some exercise reminders: 

- It's ok to coerce types, we sometimes need to massage them, but not to do `as unknown as SomeType`. 


