export class SliderTracker {
    constructor(selector, callback) {
        this.inputElement = document.querySelector(selector);
        this.callback = callback;

        this._handler = () => {
            if (this.callback) {
                let value = $(this.inputElement).attr("data-slider");

                if (!isNaN(value))
                    this.callback(value);
            }
        };

        $(this.inputElement).on("change.fndtn.slider", this._handler);
    }

    remove() {
        $(this.inputElement).off("change.fndtn.slider", this._handler);
        this.inputElement = null;
    }


}
