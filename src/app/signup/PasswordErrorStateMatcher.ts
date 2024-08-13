import { ErrorStateMatcher } from "@angular/material/core"; //utility class in ng mat that determines when form controls should display error messages.
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms'; //form controls

export class PasswordErrorStateMatcher implements ErrorStateMatcher { //this class implements the imported ErrorStateMatcher class
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {  //gives a boolean output after checking the form control and parent form
        //checks if the pw field is empty, doesnt meet requirements and if the form has been touched (something typed)
        const invalidCtrl = !!(control && control.invalid && control.parent!.dirty);
        //checks if the parent form is invalid and if the form has been touched (something typed)
        const invalidParent = !!(control && control.parent && control.parent.invalid && control.parent.dirty);

        return (invalidCtrl || invalidParent); //returns true if either the control or the form has been touched
    }
}
