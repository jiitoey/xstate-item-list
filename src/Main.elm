module Main exposing (main)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Decode as D
import Json.Decode.Pipeline as P
import Json.Encode as E
import MachineConnector


main : Program () Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


type alias Item =
    { artistName : String
    , id : String
    , price : Float
    , currency : String
    , end : String
    }


type alias Model =
    { state : State
    , pageSize : Int
    , page : Int
    , sortBy : String
    , totalItems : Int
    , items : List Item
    }


type State
    = Loading
    | Display
    | Failed


modelDecoder : D.Decoder Model
modelDecoder =
    D.map6 Model
        stateDecoder
        pageSizeDecoder
        pageDecoder
        sortByDecoder
        totalItemsDecoder
        itemsDecoder


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "loading" ->
                        D.succeed Loading

                    "display" ->
                        D.succeed Display

                    "failed" ->
                        D.succeed Failed

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


pageSizeDecoder : D.Decoder Int
pageSizeDecoder =
    D.at [ "context", "pageSize" ] D.int


pageDecoder : D.Decoder Int
pageDecoder =
    D.at [ "context", "page" ] D.int


sortByDecoder : D.Decoder String
sortByDecoder =
    D.at [ "context", "sortBy" ] D.string


totalItemsDecoder : D.Decoder Int
totalItemsDecoder =
    D.at [ "context", "totalItems" ] D.int


itemsDecoder : D.Decoder (List Item)
itemsDecoder =
    D.at [ "context", "items" ] (D.list itemDecoder)


itemDecoder : D.Decoder Item
itemDecoder =
    D.succeed Item
        |> P.required "artistName" D.string
        |> P.required "id" D.string
        |> P.required "price" D.float
        |> P.required "currency" D.string
        |> P.required "end" D.string


type Msg
    = StateChanged Model
    | DecodeStateError D.Error
    | PageChanged Int
    | PageSizeChanged Int
    | SortChanged String
    | ReloadClicked


init : () -> ( Model, Cmd Msg )
init _ =
    ( { state = Loading
      , pageSize = 15
      , page = 1
      , sortBy = "artistName"
      , totalItems = 0
      , items = []
      }
    , Cmd.none
    )


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( m, Cmd.none )

        DecodeStateError _ ->
            ( model, Cmd.none )

        PageChanged page ->
            ( { model | page = page }
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "PAGE.PAGE_CHANGED" )
                    , ( "page", E.int page )
                    ]
                )
            )

        PageSizeChanged pageSize ->
            ( { model | pageSize = pageSize }
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "PAGE.SIZE_CHANGED" )
                    , ( "pageSize", E.int pageSize )
                    ]
                )
            )

        SortChanged sortBy ->
            ( { model | sortBy = sortBy }
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "ITEMS.SORT_CHANGED" )
                    , ( "sortBy", E.string sortBy )
                    ]
                )
            )

        ReloadClicked ->
            ( model
            , MachineConnector.event
                (E.object
                    [ ( "type", E.string "SEARCH_BOX.SEARCH_CLICKED" )
                    ]
                )
            )


view : Model -> Html Msg
view model =
    div [ Attr.id "main__view" ]
        [ div []
            [ text <| String.fromInt (List.length model.items)
            ]
        , div []
            [ text "Sort By: "
            , button [ onClick <| SortChanged "artistName" ] [ text "Artist Name" ]
            , button [ onClick <| SortChanged "id" ] [ text "ID" ]
            , button [ onClick <| SortChanged "price" ] [ text "Price" ]
            , button [ onClick <| SortChanged "end" ] [ text "End Date" ]
            ]
        , div []
            [ text "Page Size: "
            , button [ onClick <| PageSizeChanged 9 ] [ text "9" ]
            , button [ onClick <| PageSizeChanged 15 ] [ text "15" ]
            ]
        , div [] <|
            List.map
                (\item ->
                    div []
                        [ span [ Attr.style "margin-right" "20px" ] [ text item.artistName ]
                        , span [ Attr.style "margin-right" "20px" ] [ text item.id ]
                        , span [ Attr.style "margin-right" "20px" ] [ text <| String.fromFloat item.price ]
                        , span [ Attr.style "margin-right" "20px" ] [ text item.currency ]
                        , span [ Attr.style "margin-right" "20px" ] [ text item.end ]
                        ]
                )
            <|
                model.items
        , div []
            [ text <| "Page: " ++ String.fromInt model.page
            , button
                [ onClick <| PageChanged (model.page - 1)
                , Attr.disabled <| isFirstPage model
                ]
                [ text "Back" ]
            , button
                [ onClick <| PageChanged (model.page + 1)
                , Attr.disabled <| isLastPage model
                ]
                [ text "Next" ]
            ]
        ]


isFirstPage : Model -> Bool
isFirstPage model =
    model.page == 1


isLastPage : Model -> Bool
isLastPage model =
    let
        lastPage =
            ceiling (toFloat model.totalItems / toFloat model.pageSize)
    in
    model.page == lastPage


subscriptions : Model -> Sub Msg
subscriptions _ =
    MachineConnector.stateChanged
        (\value ->
            case D.decodeValue modelDecoder value of
                Ok m ->
                    StateChanged m

                Err e ->
                    DecodeStateError e
        )
