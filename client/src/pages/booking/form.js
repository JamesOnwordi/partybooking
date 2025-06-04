import { useForm, SubmitHandler } from "react-hook-form"

export default function Form(){


    return(<>
    <div className="flex flex-column">

        <div className="flex">
           <p className="w-1/2 ">First Name: </p> 
        <input typeof=""  />
        <p className=" w-1/2">
        Last Name: 
        </p> 
        <input typeof="text" value={"a"} />
        </div>

        
       
        Email Address: <input typeof="text"  />
        Phone: <input typeof="text"  />
        PartyPackage: <input typeof="text"  />
        Celebrant's Name: <input typeof="text"  />
        Age turning: <input typeof="text"  />
        Gender
    </div>
    <form >
        <button>
          PartyDate
        </button>
        Name: <input typeof="text"  />
        Phone: <input typeof="text"  />
        Email: <input typeof="text"  />
        PartyPackage: <input typeof="text"  />
        Celebrant's Name: <input typeof="text"  />
        Age turning: <input typeof="text"  />
        Gender

       </form>
    </>)
}