let displayedNotSupportedError = false;

const checkWebGPUSupport = function () {
    if (!navigator['gpu']) {
        if (!displayedNotSupportedError) {
            alert('WebGPU not supported! Please visit webgpu.io to see the current implementation status.');
        }
        displayedNotSupportedError = true;
    }
    return !!navigator['gpu'];
}

export { checkWebGPUSupport };