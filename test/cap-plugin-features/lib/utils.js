
export function set(name, content) {
    document.getElementById(name).textContent = content
}

export async function repl(fn) {
    const fnBody = fn.toString()
    const cmd = '> ' + fnBody.slice(fnBody.indexOf('=>') + 3)
    const parent = document.getElementById('repl')
    const pre = document.createElement('pre')
    pre.textContent = `${cmd}\nloading...`
    parent.appendChild(pre)

    try {
        const result = fnBody.startsWith('async')? await fn() : fn()
        pre.textContent = `${cmd}\n${typeof result === 'string'? result : JSON.stringify(result)}`
    }
    catch (e) {
        console.log('Error: ', e)
        pre.textContent = `${cmd}\nError: ${e instanceof Error? e.message : JSON.stringify(e)}`
    }
}

export function traceConsole(cbs) {
    const old = {
        debug: console.debug,
        log: console.log,
        info: console.info,
        warn: console.warn,
        error: console.error,
    }

    console.debug = (...args) => {
        cbs.debug?.(...args)
        old.debug(...args)
    }

    console.log = (...args) => {
        cbs.log?.(...args)
        old.log(...args)
    }

    console.info = (...args) => {
        cbs.info?.(...args)
        old.info(...args)
    }

    console.warn = (...args) => {
        cbs.warn?.(...args)
        old.warn(...args)
    }

    console.error = (...args) => {
        cbs.error?.(...args)
        old.error(...args)
    }

    return () => {
        Object.assign(console, old)
    }
}
