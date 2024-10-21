-- Generate 1000 random tag_object entries
DO $$
DECLARE
    i INT;
    random_person_id UUID;
    random_event_id UUID;
    random_tag_id UUID;
    num_people INT;
    num_events INT;
    num_tags INT;
BEGIN
    -- Get the total number of people
    SELECT COUNT(*) INTO num_people FROM public.people;

    -- Get the total number of events
    SELECT COUNT(*) INTO num_events FROM public.events;

    -- Get the total number of tags
    SELECT COUNT(*) INTO num_tags FROM public.tags;

    FOR i IN 1..1000 LOOP
        -- Randomly choose whether to link the tag to a person or an event
        IF random() > 0.5 THEN
            -- Choose a random person
            SELECT id INTO random_person_id
            FROM public.people
            OFFSET floor(random() * num_people) LIMIT 1;

            -- Choose a random tag
            SELECT id INTO random_tag_id
            FROM public.tags
            OFFSET floor(random() * num_tags) LIMIT 1;

            -- Insert into tag_object for a person
            INSERT INTO public.tag_object (tag_id, object_id, object_type, created_at, updated_at)
            VALUES (random_tag_id, random_person_id, 'people', now(), now())
            ON CONFLICT (tag_id, object_id) DO NOTHING;

        ELSE
            -- Choose a random event
            SELECT id INTO random_event_id
            FROM public.events
            OFFSET floor(random() * num_events) LIMIT 1;

            -- Choose a random tag
            SELECT id INTO random_tag_id
            FROM public.tags
            OFFSET floor(random() * num_tags) LIMIT 1;

            -- Insert into tag_object for an event
            INSERT INTO public.tag_object (tag_id, object_id, object_type, created_at, updated_at)
            VALUES (random_tag_id, random_event_id, 'events', now(), now())
            ON CONFLICT (tag_id, object_id) DO NOTHING;
        END IF;
    END LOOP;
END $$;
