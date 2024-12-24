(define (domain blocks)
    (:predicates
        (on ?x ?y)
        (ontable ?x)
        (clear ?x)
        (handempty)
        (holding ?x)
    )

    (:action pickup
        :parameters (?x)
        :precondition (and (clear ?x) (ontable ?x) (handempty))
        :effect (and (not (ontable ?x))
                     (not (clear ?x))
                     (not (handempty))
                     (holding ?x))
    )

    (:action putdown
        :parameters (?x)
        :precondition (holding ?x)
        :effect (and (not (holding ?x))
                     (clear ?x)
                     (handempty)
                     (ontable ?x))
    )
) 