port module MachineConnector exposing (..)

import Json.Encode as E


port stateChanged : (E.Value -> msg) -> Sub msg


port event : E.Value -> Cmd msg
